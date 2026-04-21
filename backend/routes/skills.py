from flask import Blueprint, request, jsonify
from models.Skill import SkillModel
from utils.auth import token_required

skills_bp = Blueprint("skills_bp", __name__)

@skills_bp.route("/", methods=["GET"])
def get_skills():
    try:
        skills = SkillModel.find_all()
        # Serialize _id
        for s in skills:
            s["_id"] = str(s["_id"])
        return jsonify(skills), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@skills_bp.route("/", methods=["POST"])
@token_required
def add_skill(current_user):
    try:
        data = request.json
        name = data.get("name")
        category = data.get("category", "Other")
        
        if not name:
            return jsonify({"error": "Skill name is required"}), 400
            
        skill = SkillModel.create(name, category)
        skill["_id"] = str(skill["_id"])
        return jsonify(skill), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@skills_bp.route("/seed", methods=["POST"])
def seed_skills():
    try:
        SkillModel.seed_default_skills()
        return jsonify({"message": "Default skills seeded"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
