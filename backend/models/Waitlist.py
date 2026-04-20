from config.db import get_db
import datetime

class WaitlistModel:
    @staticmethod
    def get_collection():
        db = get_db()
        return db.waitlist

    @staticmethod
    def find_by_email(email):
        return WaitlistModel.get_collection().find_one({"email": email})

    @staticmethod
    def create(email):
        new_entry = {
            "email": email,
            "joined_at": datetime.datetime.utcnow()
        }
        WaitlistModel.get_collection().insert_one(new_entry)
        return new_entry
