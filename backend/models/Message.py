from config.db import get_db
import datetime
from bson.objectid import ObjectId

class MessageModel:
    @staticmethod
    def get_collection():
        db = get_db()
        return db.messages

    @staticmethod
    def create(sender_id, receiver_id, content):
        new_message = {
            "sender_id": str(sender_id),
            "receiver_id": str(receiver_id),
            "content": content,
            "createdAt": datetime.datetime.utcnow()
        }
        
        result = MessageModel.get_collection().insert_one(new_message)
        new_message["_id"] = str(result.inserted_id)
        return new_message

    @staticmethod
    def get_conversation(user1_id, user2_id):
        user1_id = str(user1_id)
        user2_id = str(user2_id)
        
        # Get messages where (sender == user1 and receiver == user2) 
        # OR (sender == user2 and receiver == user1)
        messages = MessageModel.get_collection().find({
            "$or": [
                {"sender_id": user1_id, "receiver_id": user2_id},
                {"sender_id": user2_id, "receiver_id": user1_id}
            ]
        }).sort("createdAt", 1)  # 1 for ascending order (oldest to newest)
        
        return list(messages)
