from config.db import get_db
import datetime
from bson.objectid import ObjectId

class SkillModel:
    @staticmethod
    def get_collection():
        db = get_db()
        return db.skills

    @staticmethod
    def find_all():
        return list(SkillModel.get_collection().find().sort("name", 1))

    @staticmethod
    def find_by_name(name):
        return SkillModel.get_collection().find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})

    @staticmethod
    def create(name, category="Other"):
        # Check if already exists
        existing = SkillModel.find_by_name(name)
        if existing:
            return existing

        new_skill = {
            "name": name,
            "category": category,
            "createdAt": datetime.datetime.utcnow()
        }
        
        result = SkillModel.get_collection().insert_one(new_skill)
        new_skill["_id"] = result.inserted_id
        return new_skill

    @staticmethod
    def seed_default_skills():
        default_skills = [
            {"name": "Python", "category": "Programming"},
            {"name": "JavaScript", "category": "Programming"},
            {"name": "React", "category": "Frontend"},
            {"name": "Node.js", "category": "Backend"},
            {"name": "MongoDB", "category": "Database"},
            {"name": "SQL", "category": "Database"},
            {"name": "UI/UX Design", "category": "Design"},
            {"name": "Graphic Design", "category": "Design"},
            {"name": "Marketing", "category": "Business"},
            {"name": "Data Science", "category": "Data"},
            {"name": "Machine Learning", "category": "Data"},
            {"name": "Public Speaking", "category": "Soft Skills"},
            {"name": "Project Management", "category": "Business"}
        ]
        
        for skill in default_skills:
            SkillModel.create(skill["name"], skill["category"])
