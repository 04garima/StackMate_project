from config.db import get_db
import datetime
from bson.objectid import ObjectId

class MatchModel:
    @staticmethod
    def get_collection():
        db = get_db()
        return db.matches

    @staticmethod
    def create(user1_id, user2_id, skills_matched):
        new_match = {
            "users": [ObjectId(user1_id), ObjectId(user2_id)],
            "skillsMatched": skills_matched,
            "status": "pending", # pending, accepted, rejected
            "createdAt": datetime.datetime.utcnow()
        }
        
        result = MatchModel.get_collection().insert_one(new_match)
        new_match["_id"] = result.inserted_id
        return new_match

    @staticmethod
    def find_between_users(user1_id, user2_id):
        return MatchModel.get_collection().find_one({
            "users": {"$all": [ObjectId(user1_id), ObjectId(user2_id)]}
        })

    @staticmethod
    def find_by_user(user_id):
        # Find all matches where this user is involved
        return list(MatchModel.get_collection().find({
            "users": ObjectId(user_id)
        }).sort("createdAt", -1))

    @staticmethod
    def update_status(match_id, status):
        result = MatchModel.get_collection().update_one(
            {"_id": ObjectId(match_id)},
            {"$set": {"status": status}}
        )
        return result.modified_count > 0
