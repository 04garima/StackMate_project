from flask import Blueprint, jsonify
from utils.auth import token_required
from config.db import get_db

match_bp = Blueprint('match', __name__)

@match_bp.route('', methods=['GET'])
@token_required
def get_matches(current_user):
    my_offered = set(current_user.get("skillsOffered", []))
    my_wanted = set(current_user.get("skillsWanted", []))
    
    db = get_db()
    # Find active student users from the SAME college, excluding current user
    college_id = current_user.get("college_id")
    if not college_id:
        return jsonify([]), 200 # If user doesn't belong to a college, no matches

    # Role check to ensure we only match with other students
    other_users = db.users.find({
        "_id": {"$ne": current_user["_id"]},
        "college_id": college_id,
        "role": "student",
        "status": "active"
    })
    
    matches = []
    
    for user in other_users:
        their_offered = set(user.get("skillsOffered", []))
        their_wanted = set(user.get("skillsWanted", []))
        
        # What I can teach them
        what_i_can_teach_them = my_offered.intersection(their_wanted)
        # What they can teach me
        what_they_can_teach_me = my_wanted.intersection(their_offered)
        
        # Match if there's AT LEAST one skill overlap (one-sided or mutual)
        if what_i_can_teach_them or what_they_can_teach_me:
            matches.append({
                "id": str(user["_id"]),
                "name": user["name"],
                "role": user.get("role", "student"),
                "email": user["email"],
                "bio": user.get("bio", ""),
                "youCanTeach": list(what_i_can_teach_them),
                "theyCanTeach": list(what_they_can_teach_me)
            })
            
    return jsonify(matches), 200
