from flask import Blueprint, jsonify, request
from utils.auth import token_required
from config.db import get_db
from bson.objectid import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/colleges', methods=['GET'])
@token_required
def search_colleges(current_user):
    if current_user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    query = request.args.get('search', '')
    db = get_db()
    
    # regex match on name or domain
    filter_query = {}
    if query:
        filter_query = {"$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"domain": {"$regex": query, "$options": "i"}}
        ]}
        
    colleges = db.colleges.find(filter_query)
    
    result = []
    for c in colleges:
        result.append({
            "id": str(c["_id"]),
            "name": c["name"],
            "domain": c["domain"],
            "status": c.get("status", "pending")
        })
        
    return jsonify(result), 200

@admin_bp.route('/colleges/<college_id>/status', methods=['PUT'])
@token_required
def update_college_status(current_user, college_id):
    if current_user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403
        
    data = request.json
    new_status = data.get("status")
    
    if new_status not in ["approved", "pending", "rejected", "blacklisted"]:
        return jsonify({"message": "Invalid status"}), 400
        
    db = get_db()
    db.colleges.update_one({"_id": ObjectId(college_id)}, {"$set": {"status": new_status}})
    return jsonify({"message": f"Status updated to {new_status}"}), 200
