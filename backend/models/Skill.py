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
            # Programming & Languages
            {"name": "Python", "category": "Programming"},
            {"name": "JavaScript", "category": "Programming"},
            {"name": "Java", "category": "Programming"},
            {"name": "C++", "category": "Programming"},
            {"name": "Rust", "category": "Programming"},
            {"name": "TypeScript", "category": "Programming"},
            {"name": "Go", "category": "Programming"},
            
            # Web & Mobile
            {"name": "React", "category": "Frontend"},
            {"name": "Next.js", "category": "Frontend"},
            {"name": "Tailwind CSS", "category": "Frontend"},
            {"name": "Node.js", "category": "Backend"},
            {"name": "Express.js", "category": "Backend"},
            {"name": "Flutter", "category": "Mobile"},
            {"name": "React Native", "category": "Mobile"},
            {"name": "Swift", "category": "Mobile"},
            {"name": "Kotlin", "category": "Mobile"},
            
            # Data & AI
            {"name": "Data Science", "category": "Data"},
            {"name": "Machine Learning", "category": "Data"},
            {"name": "Deep Learning", "category": "Data"},
            {"name": "PyTorch", "category": "AI"},
            {"name": "TensorFlow", "category": "AI"},
            {"name": "NLP", "category": "AI"},
            {"name": "Power BI", "category": "Data"},
            {"name": "Tableau", "category": "Data"},
            
            # Cloud & DevOps
            {"name": "AWS", "category": "Cloud"},
            {"name": "Azure", "category": "Cloud"},
            {"name": "Docker", "category": "DevOps"},
            {"name": "Kubernetes", "category": "DevOps"},
            {"name": "GitHub Actions", "category": "DevOps"},
            
            # Database
            {"name": "MongoDB", "category": "Database"},
            {"name": "PostgreSQL", "category": "Database"},
            {"name": "Redis", "category": "Database"},
            {"name": "SQL", "category": "Database"},
            
            # Finance & Business
            {"name": "Investment Banking", "category": "Finance"},
            {"name": "Financial Modeling", "category": "Finance"},
            {"name": "Stock Market Analysis", "category": "Finance"},
            {"name": "Accounting", "category": "Finance"},
            {"name": "Entrepreneurship", "category": "Business"},
            {"name": "Project Management", "category": "Business"},
            {"name": "Digital Marketing", "category": "Marketing"},
            {"name": "SEO & SEM", "category": "Marketing"},
            {"name": "Content Strategy", "category": "Marketing"},
            {"name": "Public Relations", "category": "Marketing"},
            {"name": "Sales & Negotiation", "category": "Business"},
            
            # Creative Arts & Media
            {"name": "Photography", "category": "Creative"},
            {"name": "Videography", "category": "Creative"},
            {"name": "Creative Writing", "category": "Creative"},
            {"name": "Copywriting", "category": "Creative"},
            {"name": "3D Modeling (Blender)", "category": "Creative"},
            {"name": "Motion Graphics", "category": "Creative"},
            {"name": "Music Production", "category": "Creative"},
            {"name": "Fine Arts", "category": "Arts"},
            
            # Engineering & Science
            {"name": "AutoCAD", "category": "Engineering"},
            {"name": "SolidWorks", "category": "Engineering"},
            {"name": "Robotics", "category": "Engineering"},
            {"name": "MATLAB", "category": "Engineering"},
            {"name": "Embedded Systems", "category": "Engineering"},
            {"name": "Biology & Biotech", "category": "Science"},
            {"name": "Physics", "category": "Science"},
            {"name": "Mathematics", "category": "Science"},
            
            # Soft Skills & Leadership
            {"name": "Leadership", "category": "Soft Skills"},
            {"name": "Emotional Intelligence", "category": "Soft Skills"},
            {"name": "Critical Thinking", "category": "Soft Skills"},
            {"name": "Public Speaking", "category": "Soft Skills"},
            {"name": "Time Management", "category": "Soft Skills"},
            {"name": "Conflict Resolution", "category": "Soft Skills"},
            {"name": "Mentoring", "category": "Soft Skills"}
        ]
        
        for skill in default_skills:
            SkillModel.create(skill["name"], skill["category"])
