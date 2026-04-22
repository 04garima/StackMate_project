from flask import Blueprint, request, jsonify
from utils.auth import token_required
from config.db import get_db
import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/me', methods=['GET'])
@token_required
def get_my_profile(current_user):
    # we don't want to send the password hash or internal ids out
    user_data = {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user.get("role", "student"),
        "skillsOffered": current_user.get("skillsOffered", []),
        "skillsWanted": current_user.get("skillsWanted", []),
        "bio": current_user.get("bio", "")
    }
    return jsonify(user_data), 200

@profile_bp.route('/skills', methods=['PUT'])
@token_required
def update_skills(current_user):
    data = request.get_json()
    
    skills_offered = data.get("skillsOffered")
    skills_wanted = data.get("skillsWanted")
    
    if skills_offered is None or skills_wanted is None:
        return jsonify({"error": "Please provide both skillsOffered and skillsWanted"}), 400
        
    db = get_db()
    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "skillsOffered": skills_offered,
            "skillsWanted": skills_wanted
        }}
    )

    # Update Global Skill Database
    all_new_skills = set(skills_offered + skills_wanted)
    for skill in all_new_skills:
        skill_name = skill.strip()
        if not skill_name: continue
        
        normalized_name = skill_name.lower()
        db.skills.update_one(
            {"name_lower": normalized_name},
            {
                "$set": {
                    "name": skill_name, 
                    "name_lower": normalized_name,
                    "category": "Community",
                    "lastUsed": datetime.datetime.utcnow()
                }, 
                "$inc": {"usage_count": 1}
            },
            upsert=True
        )
    
    return jsonify({"message": "Skills updated successfully and registered in Global Database"}), 200
