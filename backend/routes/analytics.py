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
            
    # New Analytics: Most Exchanged Skills and Most Active Students
    accepted_matches = list(db.matches.find({"status": "accepted"}))
    exchanged_skills_count = {}
    active_students_count = {}
    
    # Pre-fetch all students in this college for faster lookup
    college_student_ids = {str(s["_id"]) for s in db.users.find({"college_id": c_id}, {"_id": 1})}
    
    for m in accepted_matches:
        u1_id = str(m["users"][0])
        u2_id = str(m["users"][1])
        
        # If either user is from this college, count the skills and the student
        involvement = False
        if u1_id in college_student_ids:
            active_students_count[u1_id] = active_students_count.get(u1_id, 0) + 1
            involvement = True
        if u2_id in college_student_ids:
            active_students_count[u2_id] = active_students_count.get(u2_id, 0) + 1
            involvement = True
            
        if involvement:
            for skill in m.get("skillsMatched", []):
                exchanged_skills_count[skill] = exchanged_skills_count.get(skill, 0) + 1
    
    # Convert active student IDs to names
    top_active_students = []
    sorted_active = sorted(active_students_count.items(), key=lambda x: -x[1])[:5]
    from bson.objectid import ObjectId
    for s_id, count in sorted_active:
        user_doc = db.users.find_one({"_id": ObjectId(s_id)}, {"name": 1})
        if user_doc:
            top_active_students.append({"name": user_doc["name"], "count": count})

    return jsonify({
        "totalStudents": total_students,
        "mostOffered": sorted(offered_counts.items(), key=lambda x: -x[1])[:5],
        "mostWanted": sorted(wanted_counts.items(), key=lambda x: -x[1])[:5],
        "mostExchanged": sorted(exchanged_skills_count.items(), key=lambda x: -x[1])[:5],
        "topStudents": top_active_students
    }), 200
