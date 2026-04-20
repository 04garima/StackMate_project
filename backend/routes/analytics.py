from flask import Blueprint, jsonify, request
from utils.auth import token_required
from config.db import get_db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/admin', methods=['GET'])
@token_required
def get_admin_analytics(current_user):
    if current_user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    db = get_db()
    total_students = db.users.count_documents({"role": "student"})
    total_colleges = db.colleges.count_documents({})
    
    # Calculate some basic skill stats
    students = db.users.find({"role": "student"})
    offered_counts = {}
    wanted_counts = {}
    
    for s in students:
        for skill in s.get("skillsOffered", []):
            offered_counts[skill] = offered_counts.get(skill, 0) + 1
        for skill in s.get("skillsWanted", []):
            wanted_counts[skill] = wanted_counts.get(skill, 0) + 1
            
    return jsonify({
        "totalStudents": total_students,
        "totalColleges": total_colleges,
        "mostOffered": sorted(offered_counts.items(), key=lambda x: -x[1])[:5],
        "mostWanted": sorted(wanted_counts.items(), key=lambda x: -x[1])[:5]
    }), 200

@analytics_bp.route('/college', methods=['GET'])
@token_required
def get_college_analytics(current_user):
    if current_user.get("role") != "college":
        return jsonify({"message": "Unauthorized"}), 403

    db = get_db()
    c_id = current_user.get("college_id")
    
    total_students = db.users.count_documents({"role": "student", "college_id": c_id})
    
    students = db.users.find({"role": "student", "college_id": c_id})
    offered_counts = {}
    wanted_counts = {}
    
    for s in students:
        for skill in s.get("skillsOffered", []):
            offered_counts[skill] = offered_counts.get(skill, 0) + 1
        for skill in s.get("skillsWanted", []):
            wanted_counts[skill] = wanted_counts.get(skill, 0) + 1
            
    return jsonify({
        "totalStudents": total_students,
        "mostOffered": sorted(offered_counts.items(), key=lambda x: -x[1])[:5],
        "mostWanted": sorted(wanted_counts.items(), key=lambda x: -x[1])[:5]
    }), 200
