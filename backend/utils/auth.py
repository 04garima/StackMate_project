from functools import wraps
from flask import request, jsonify
import jwt
import os
from models.User import UserModel

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Look for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401
        
        try:
            # Decode token
            secret_key = os.environ.get("JWT_SECRET", "super-secret-key-change-in-production")
            data = jwt.decode(token, secret_key, algorithms=["HS256"])
            
            # Find the user by the ID embedded in the JWT payload
            current_user = UserModel.find_by_id(data["user_id"])
            if not current_user:
                return jsonify({"error": "User no longer exists!"}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token is invalid!"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated
