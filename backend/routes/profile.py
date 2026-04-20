from flask import Blueprint, request, jsonify
from utils.auth import token_required
from config.db import get_db

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
    
    return jsonify({"message": "Skills updated successfully"}), 200
