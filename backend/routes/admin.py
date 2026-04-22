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
        # Robust name fetching: try 'name', then 'college_name', then fallback to domain part or domain itself
        college_name = c.get("name") or c.get("college_name")
        if not college_name and c.get("domain"):
            college_name = c.get("domain").split('.')[0].capitalize()
            
        result.append({
            "id": str(c["_id"]),
            "name": college_name or "Unnamed College",
            "domain": c.get("domain", "No Domain"),
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
    
    # NEW: Also update college admin user status and existing students
    college = db.colleges.find_one({"_id": ObjectId(college_id)})
    if college:
        # 1. Activate/Deactivate College Admin User
        user_status = "active" if new_status == "approved" else "inactive"
        if college.get("admin_email"):
            db.users.update_one(
                {"email": college["admin_email"], "role": "college"},
                {"$set": {"status": user_status}}
            )
        
        # 2. If approved, link all students with this domain to this college
        if new_status == "approved":
            domain = college.get("domain")
            db.users.update_many(
                {"email": {"$regex": f"@{domain}$"}, "role": "student", "college_id": None},
                {"$set": {"college_id": str(college["_id"])}}
            )

    return jsonify({"message": f"Status updated to {new_status}"}), 200
