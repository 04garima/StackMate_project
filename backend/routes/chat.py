from flask import Blueprint, jsonify, request
from utils.auth import token_required
from models.Message import MessageModel
from models.User import UserModel
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
            
        return jsonify(formatted_messages), 200
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
            
        # Optional: ensure they are from the same college
        if current_user.get("college_id") and receiver.get("college_id"):
            if current_user.get("college_id") != receiver.get("college_id"):
                return jsonify({"error": "Cannot chat with students outside your college"}), 403
                
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
