import os
from flask import Blueprint, request, jsonify
from models.Waitlist import WaitlistModel

# Create a blueprint for waitlist routes
waitlist_bp = Blueprint("waitlist_bp", __name__)

@waitlist_bp.route("/add", methods=["POST"])
def add_to_waitlist():
    try:
        data = request.json
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        # Check if email is already in the waitlist using Model
        existing_user = WaitlistModel.find_by_email(email)
        if existing_user:
            return jsonify({"error": "Email already in waitlist"}), 400
            
        # Insert the new waitlist entry using Model
        WaitlistModel.create(email)
        
        return jsonify({"message": "Successfully added to the waitlist!"}), 201
        
    except Exception as e:
        print(f"Error adding to waitlist: {e}")
        return jsonify({"error": "Failed to add to waitlist. Database issue?"}), 500
