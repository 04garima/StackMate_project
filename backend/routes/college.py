from flask import Blueprint, request, jsonify
from utils.auth import token_required
from models.College import CollegeModel
from config.db import get_db
from bson.objectid import ObjectId

college_bp = Blueprint("college", __name__)

@college_bp.route("/register", methods=["POST"])
def register_college():
    try:
        data = request.json
        name = data.get("name")
        domain = data.get("domain")
        email = data.get("email")
        password = data.get("password")
        
        if not name or not domain or not email or not password:
            return jsonify({"error": "All fields (name, domain, email, password) are required"}), 400
            
        if CollegeModel.find_by_domain(domain):
            return jsonify({"error": "College domain is already registered or pending"}), 400
            
        from models.User import UserModel
        if UserModel.find_by_email(email):
            return jsonify({"error": "Email is already registered"}), 400

        new_college = CollegeModel.create(name=name, domain=domain, admin_email=email, status="pending")
        
        # Create college user account (inactive until college is approved)
        UserModel.create(
            name=f"{name} Admin",
            email=email,
            password=password,
            role="college",
            college_id=str(new_college["_id"]),
            status="inactive"
        )
        
        return jsonify({
            "message": "College registration submitted. You can login after admin approval.",
            "college": {
                "id": str(new_college["_id"]),
                "name": new_college["name"],
                "domain": new_college["domain"],
                "status": new_college["status"]
            }
        }), 201

    except Exception as e:
        print(f"College register error: {e}")
        return jsonify({"error": "Server error during college registration"}), 500


@college_bp.route("/", methods=["GET"])
@token_required
def get_colleges(current_user):
    if current_user.get("role") != "admin":
        return jsonify({"error": "Unauthorized access. Admins only."}), 403
        
    try:
        colleges = CollegeModel.find_all()
        # Convert _id to string for JSON serialization
        for c in colleges:
            c["_id"] = str(c["_id"])
            c["id"] = c["_id"]
        return jsonify(colleges), 200
    except Exception as e:
        print(f"Error fetching colleges: {e}")
        return jsonify({"error": "Server error while fetching colleges"}), 500


@college_bp.route("/<college_id>/status", methods=["PUT"])
@token_required
def update_college_status(current_user, college_id):
    if current_user.get("role") != "admin":
        return jsonify({"error": "Unauthorized access. Admins only."}), 403
        
    try:
        data = request.json
        status = data.get("status")
        
        if status not in ["approved", "rejected"]:
            return jsonify({"error": "Invalid status. Use 'approved' or 'rejected'."}), 400
            
        success = CollegeModel.update_status(college_id, status)
        if success:
            # Also update the college admin user status
            college = CollegeModel.get_collection().find_one({"_id": ObjectId(college_id)})
            if college and college.get("admin_email"):
                db = get_db()
                user_status = "active" if status == "approved" else "inactive"
                db.users.update_one(
                    {"email": college["admin_email"], "role": "college"},
                    {"$set": {"status": user_status}}
                )
            return jsonify({"message": f"College status updated to {status}"}), 200
        else:
            return jsonify({"error": "College not found or no changes made"}), 404
            
    except Exception as e:
        print(f"Error updating college status: {e}")
        return jsonify({"error": "Server error while updating status"}), 500

@college_bp.route("/students", methods=["GET"])
@token_required
def get_college_students(current_user):
    if current_user.get("role") != "college":
        return jsonify({"error": "Unauthorized"}), 403
    
    db = get_db()
    c_id = current_user.get("college_id")
    query = request.args.get('search', '')
    
    filter_query = {"role": "student", "college_id": c_id}
    if query:
        filter_query["$or"] = [
            {"name": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]
        
    students = db.users.find(filter_query)
    
    result = []
    for s in students:
        result.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "email": s["email"],
            "skillsOffered": s.get("skillsOffered", []),
            "skillsWanted": s.get("skillsWanted", []),
            "status": s.get("status", "active")
        })
    return jsonify(result), 200

@college_bp.route("/students/<student_id>/status", methods=["PUT"])
@token_required
def update_student_status(current_user, student_id):
    if current_user.get("role") != "college":
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.json
    new_status = data.get("status")
    
    if new_status not in ["active", "blacklisted"]:
        return jsonify({"error": "Invalid status"}), 400
        
    db = get_db()
    db.users.update_one({"_id": ObjectId(student_id)}, {"$set": {"status": new_status}})
    return jsonify({"message": f"Student status updated to {new_status}"}), 200
