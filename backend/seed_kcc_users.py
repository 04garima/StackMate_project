import os
import sys
import bcrypt
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from config.db import get_db

def seed_kcc_users():
    db = get_db()
    # KCC College ID
    college_id = ObjectId("69e85044433b4a489994b4ad")
    
    # Password hashing
    password = "password123"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    new_users = []
    
    # Core skill pools
    all_skills = ["Python", "React", "Node.js", "MongoDB", "Data Science", "Digital Marketing", "SEO", "Figma", "UI/UX Design"]
    
    for i in range(1, 31):
        name = f"User {i}"
        email = f"user{i}@kcc.ac.in"
        
        # User 1 is the "Universal Provider" - he offers EVERYTHING
        if i == 1:
            offered = all_skills
            wanted = ["Anything"]
        # All other users alternate skills to ensure mutual matches with each other and User 1
        elif i % 2 == 0:
            offered = ["Python", "React", "Data Science"]
            wanted = ["Digital Marketing", "SEO", "Figma"]
        else:
            offered = ["Digital Marketing", "SEO", "Figma"]
            wanted = ["Python", "React", "Data Science"]

        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": "student",
            "college_id": college_id,
            "skillsOffered": offered,
            "skillsWanted": wanted,
            "bio": f"Hi, I'm {name} from KCC. Let's match and build something amazing!",
            "is_verified": True
        }
        new_users.append(user_doc)

    # Insert Users
    if new_users:
        for user in new_users:
            db.users.update_one(
                {"email": user["email"]},
                {"$set": user},
                upsert=True
            )
        print(f"Successfully seeded Users 1 to 30 for KCC. User 1 is the Universal Match.")

if __name__ == "__main__":
    seed_kcc_users()
