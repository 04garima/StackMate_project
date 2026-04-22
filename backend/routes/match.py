from flask import Blueprint, jsonify, request
from utils.auth import token_required
from config.db import get_db
from models.Match import MatchModel
from utils.ai_scoring import calculate_match_score
from bson.objectid import ObjectId

match_bp = Blueprint('match', __name__)

@match_bp.route('', methods=['GET'])
@token_required
def get_matches(current_user):
    my_offered = set(current_user.get("skillsOffered", []))
    my_wanted = set(current_user.get("skillsWanted", []))
    
    db = get_db()
    # Find active student users from the SAME college, excluding current user
    college_id = current_user.get("college_id")
    
    # Fallback for older users without college_id
    if not college_id and "@" in current_user["email"]:
        domain = current_user["email"].split("@")[1]
        from models.College import CollegeModel
        college = CollegeModel.find_by_domain(domain)
        if college:
            college_id = str(college["_id"])
            db.users.update_one({"_id": current_user["_id"]}, {"$set": {"college_id": college_id}})

    if not college_id:
        return jsonify([]), 200

    # Fetch all potential peers from the same college
    other_users = db.users.find({
        "_id": {"$ne": current_user["_id"]},
        "college_id": college_id,
        "role": "student",
        "status": "active"
    })
    
    matches = []
    filter_type = request.args.get('type', 'mutual')
    
    def normalize_skills(skill_list):
        normalized = set()
        for s in skill_list:
            if isinstance(s, str):
                parts = s.split(',')
                for p in parts:
                    clean = p.strip().lower()
                    if clean:
                        normalized.add(clean)
        return normalized

    my_offered_norm = normalize_skills(current_user.get("skillsOffered", []))
    my_wanted_norm = normalize_skills(current_user.get("skillsWanted", []))

    for user in other_users:
        their_offered = normalize_skills(user.get("skillsOffered", []))
        their_wanted = normalize_skills(user.get("skillsWanted", []))
        
        what_i_can_teach_them = my_offered_norm.intersection(their_wanted)
        what_they_can_teach_me = my_wanted_norm.intersection(their_offered)
        
        # Determine if we should include this user based on filter
        include = False
        if filter_type == 'all':
            include = (what_i_can_teach_them or what_they_can_teach_me)
        elif filter_type == 'mutual':
            include = (what_i_can_teach_them and what_they_can_teach_me)
        elif filter_type == 'they_teach':
            include = bool(what_they_can_teach_me)
        elif filter_type == 'i_teach':
            include = bool(what_i_can_teach_them)
            
        if include:
            # Check if a match request already exists
            existing = MatchModel.find_between_users(current_user["_id"], user["_id"])
            status = existing.get("status") if existing else "none"
            
            # Check block status
            is_blocked_by_me = str(user["_id"]) in [str(id) for id in current_user.get("blockedUsers", [])]
            has_blocked_me = str(current_user["_id"]) in [str(id) for id in user.get("blockedUsers", [])]
            
            # If not connected and either user is blocked, we should probably hide them from discovery
            if status != 'accepted' and (is_blocked_by_me or has_blocked_me):
                continue

            # Get AI Score (Only from cache or fallback by default)
            ai_data = calculate_match_score(current_user, user, force_ai=False)
            score = ai_data.get("score", 0)
            reason = ai_data.get("reason", "")
            is_ai = ai_data.get("is_ai", False)

            # Filter out zero scores (only if it was a real AI match or keyword overlap)
            if score <= 0:
                continue

            matches.append({
                "id": str(user["_id"]),
                "name": user["name"],
                "role": user.get("role", "student"),
                "email": user["email"],
                "bio": user.get("bio", ""),
                "youCanTeach": list(what_i_can_teach_them),
                "theyCanTeach": list(what_they_can_teach_me),
                "connectionStatus": status,
                "isBlockedByMe": is_blocked_by_me,
                "hasBlockedMe": has_blocked_me,
                "matchScore": score,
                "matchReason": reason,
                "isAI": is_ai
            })
            
    # Sort by matchScore descending
    matches.sort(key=lambda x: x["matchScore"], reverse=True)
    return jsonify(matches), 200

@match_bp.route('/ai-score/<peer_id>', methods=['GET'])
@token_required
def get_on_demand_score(current_user, peer_id):
    db = get_db()
    peer = db.users.find_one({"_id": ObjectId(peer_id)})
    if not peer:
        return jsonify({"error": "User not found"}), 404
        
    # Force Gemini scoring for this specific user
    ai_data = calculate_match_score(current_user, peer, force_ai=True)
    return jsonify(ai_data), 200

@match_bp.route('/request', methods=['POST'])
@token_required
def send_match_request(current_user):
    data = request.json
    target_user_id = data.get("target_user_id")
    
    if not target_user_id:
        return jsonify({"error": "Target user ID required"}), 400
        
    existing = MatchModel.find_between_users(current_user["_id"], target_user_id)
    if existing:
        return jsonify({"message": "Request already exists"}), 200
        
    db = get_db()
    target_user = db.users.find_one({"_id": ObjectId(target_user_id)})
    if not target_user:
        return jsonify({"error": "Target user not found"}), 404

    def normalize_skills(skill_list):
        normalized = set()
        for s in skill_list:
            if isinstance(s, str):
                parts = s.split(',')
                for p in parts:
                    clean = p.strip().lower()
                    if clean:
                        normalized.add(clean)
        return normalized

    my_offered = normalize_skills(current_user.get("skillsOffered", []))
    my_wanted = normalize_skills(current_user.get("skillsWanted", []))
    their_offered = normalize_skills(target_user.get("skillsOffered", []))
    their_wanted = normalize_skills(target_user.get("skillsWanted", []))

    skills_matched = list(my_offered.intersection(their_wanted).union(my_wanted.intersection(their_offered)))

    MatchModel.create(current_user["_id"], target_user_id, skills_matched)
    return jsonify({"message": "Match request sent"}), 201

@match_bp.route('/connections', methods=['GET'])
@token_required
def get_connections(current_user):
    connections = MatchModel.find_by_user(current_user["_id"])
    db = get_db()
    
    result = []
    for conn in connections:
        # Find the OTHER user in the connection
        other_user_id = [u for u in conn["users"] if str(u) != str(current_user["_id"])][0]
        other_user = db.users.find_one({"_id": ObjectId(other_user_id)})
        
        if other_user:
            result.append({
                "match_id": str(conn["_id"]),
                "status": conn["status"],
                "createdAt": conn["createdAt"],
                "sender_id": str(conn["users"][0]),
                "isBlockedByMe": str(other_user["_id"]) in [str(id) for id in current_user.get("blockedUsers", [])],
                "hasBlockedMe": str(current_user["_id"]) in [str(id) for id in other_user.get("blockedUsers", [])],
                "peer": {
                    "id": str(other_user["_id"]),
                    "name": other_user["name"],
                    "email": other_user["email"],
                    "role": other_user.get("role", "student"),
                    "bio": other_user.get("bio", "")
                }
            })
            
    return jsonify(result), 200

@match_bp.route('/respond', methods=['PUT'])
@token_required
def respond_to_request(current_user):
    data = request.json
    match_id = data.get("match_id")
    action = data.get("action")
    
    if action not in ["accepted", "rejected"]:
        return jsonify({"error": "Invalid action"}), 400
        
    MatchModel.update_status(match_id, action)
    return jsonify({"message": f"Match {action}"}), 200
