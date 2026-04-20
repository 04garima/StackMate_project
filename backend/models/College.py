from config.db import get_db
import datetime
from bson.objectid import ObjectId

class CollegeModel:
    @staticmethod
    def get_collection():
        db = get_db()
        return db.colleges

    @staticmethod
    def find_by_domain(domain):
        return CollegeModel.get_collection().find_one({"domain": domain})

    @staticmethod
    def find_all():
        return list(CollegeModel.get_collection().find())

    @staticmethod
    def create(name, domain, status="pending"):
        new_college = {
            "name": name,
            "domain": domain,
            "status": status,
            "createdAt": datetime.datetime.utcnow()
        }
        
        result = CollegeModel.get_collection().insert_one(new_college)
        new_college["_id"] = result.inserted_id
        return new_college

    @staticmethod
    def update_status(college_id, new_status):
        result = CollegeModel.get_collection().update_one(
            {"_id": ObjectId(college_id)},
            {"$set": {"status": new_status}}
        )
        return result.modified_count > 0
