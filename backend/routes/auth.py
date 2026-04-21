from flask import Blueprint, request, jsonify
from models.User import UserModel
import jwt
import datetime
import os

auth_bp = Blueprint("auth_bp", __name__)

def generate_token(user_id):
    secret_key = os.environ.get("JWT_SECRET", "super-secret-key-change-in-production")
    payload = {
        "user_id": str(user_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7) # Token expires in 7 days
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")

@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        
        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400
            
        # Check if email is already in use
        if UserModel.find_by_email(email):
            return jsonify({"error": "Email is already registered"}), 400
            
        # Optional: College email check (just extracting for now)
        college_id = None
        if "@" in email:
            domain = email.split("@")[1]
            from models.College import CollegeModel
            college = CollegeModel.find_by_domain(domain)
            if not college or college.get("status") != "approved":
                return jsonify({"error": f"College domain '{domain}' is not registered or not yet approved by an admin."}), 400
            college_id = str(college["_id"])
        else:
            return jsonify({"error": "Invalid email format"}), 400
        # Create user
        new_user = UserModel.create(name=name, email=email, password=password, college_id=college_id)
        
        # Generate token
        token = generate_token(new_user["_id"])
        
        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user": {
                "id": str(new_user["_id"]),
                "name": new_user["name"],
                "email": new_user["email"],
                "role": new_user["role"]
            }
        }), 201

    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"error": "Server error during signup"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        # Find user
        user = UserModel.find_by_email(email)
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
            
        # Verify password
        if not UserModel.verify_password(password, user["password"]):
            return jsonify({"error": "Invalid email or password"}), 401
            
        # Provide token
        token = generate_token(user["_id"])
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Server error during login"}), 500
