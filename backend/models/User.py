from config.db import get_db
import bcrypt
import datetime
from bson.objectid import ObjectId

class UserModel:
    @staticmethod
    def get_collection():
        db = get_db()
        return db.users

    @staticmethod
    def find_by_email(email):
        return UserModel.get_collection().find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        return UserModel.get_collection().find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def create(name, email, password, role="student", college_id=None, status="active"):
        # Hash the password with bcrypt
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), salt)

        new_user = {
            "name": name,
            "email": email,
            "password": hashed_pw.decode('utf-8'), # Store as string
            "role": role,
            "status": status, # active, inactive, blacklisted
            "college_id": college_id, # string representation of college's ObjectId
            "skillsOffered": [],
            "skillsWanted": [],
            "bio": "",
            "createdAt": datetime.datetime.utcnow()
        }
        
        result = UserModel.get_collection().insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return new_user

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
