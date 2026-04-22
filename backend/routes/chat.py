from flask import Blueprint, jsonify, request
from utils.auth import token_required
from models.Message import MessageModel
from models.User import UserModel
from models.Match import MatchModel
from config.db import get_db
from bson.objectid import ObjectId

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/history/<user_id>', methods=['GET'])
@token_required
def get_chat_history(current_user, user_id):
    try:
        # Check if the other user exists
        other_user = UserModel.find_by_id(user_id)
        if not other_user:
            return jsonify({"error": "User not found"}), 404
            
        messages = MessageModel.get_conversation(current_user["_id"], user_id)
        
        # Format the output
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "id": str(msg["_id"]),
                "senderId": msg["sender_id"],
                "receiverId": msg["receiver_id"],
                "content": msg["content"],
                "timestamp": msg["createdAt"].isoformat()
            })
            
        # Check block status
        is_blocked_by_me = str(user_id) in [str(id) for id in current_user.get("blockedUsers", [])]
        has_blocked_me = str(current_user["_id"]) in [str(id) for id in other_user.get("blockedUsers", [])]
        
        return jsonify({
            "messages": formatted_messages,
            "isBlockedByMe": is_blocked_by_me,
            "hasBlockedMe": has_blocked_me
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/send', methods=['POST'])
@token_required
def send_message(current_user):
    data = request.json
    receiver_id = data.get("receiverId")
    content = data.get("content")
    
    if not receiver_id or not content:
        return jsonify({"error": "receiverId and content are required"}), 400
        
    try:
        # Verify receiver exists
        receiver = UserModel.find_by_id(receiver_id)
        if not receiver:
            return jsonify({"error": "Receiver not found"}), 404
            
        # Check if either user has blocked the other
        if str(receiver_id) in [str(id) for id in current_user.get("blockedUsers", [])]:
            return jsonify({"error": "You have blocked this user"}), 403
        if str(current_user["_id"]) in [str(id) for id in receiver.get("blockedUsers", [])]:
            return jsonify({"error": "This user has blocked you"}), 403

        new_msg = MessageModel.create(current_user["_id"], receiver_id, content)
        
        return jsonify({
            "message": "Message sent successfully",
            "data": {
                "id": new_msg["_id"],
                "senderId": new_msg["sender_id"],
                "receiverId": new_msg["receiver_id"],
                "content": new_msg["content"],
                "timestamp": new_msg["createdAt"].isoformat()
            }
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@chat_bp.route('/block', methods=['POST'])
@token_required
def block_user(current_user):
    data = request.json
    target_user_id = data.get("targetUserId")
    
    if not target_user_id:
        return jsonify({"error": "targetUserId is required"}), 400
        
    try:
        # 1. Verify that a match exists and is accepted
        match = MatchModel.find_between_users(current_user["_id"], target_user_id)
        if not match or match.get("status") != "accepted":
            return jsonify({"error": "Can only block users after a match is accepted"}), 400
            
        # 2. Add to blockedUsers if not already there
        db = get_db()
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"blockedUsers": ObjectId(target_user_id)}}
        )
        
        return jsonify({"message": "User blocked successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/unblock', methods=['POST'])
@token_required
def unblock_user(current_user):
    data = request.json
    target_user_id = data.get("targetUserId")
    
    if not target_user_id:
        return jsonify({"error": "targetUserId is required"}), 400
        
    try:
        db = get_db()
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$pull": {"blockedUsers": ObjectId(target_user_id)}}
        )
        
        return jsonify({"message": "User unblocked successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
