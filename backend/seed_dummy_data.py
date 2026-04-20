import os
from dotenv import load_dotenv
import random
from models.User import UserModel
from models.College import CollegeModel
from config.db import get_db
import bcrypt

load_dotenv()

def populate_dummy_data():
    db = get_db()

    # Clear existing data to avoid duplicates for dummy generation
    db.users.delete_many({"email": {"$ne": "admin@stackmate.com"}})  # keep admin
    db.colleges.delete_many({})

    print("Cleared existing users (except admin) and colleges.")

    # 1. Create Colleges
    colleges_data = [
        {"name": "Stanford University", "domain": "stanford.edu", "status": "approved"},
        {"name": "MIT", "domain": "mit.edu", "status": "approved"},
        {"name": "University of Delhi", "domain": "du.ac.in", "status": "approved"},
        {"name": "Fake College", "domain": "fake.edu", "status": "blacklisted"}
    ]

    college_ids = []
    print("Creating Colleges...")
    for c_data in colleges_data:
        college = CollegeModel.create(c_data["name"], c_data["domain"], c_data["status"])
        college_ids.append(str(college["_id"]))
        print(f"Created college: {c_data['name']} (ID: {college['_id']})")
        
        # Need to create a college admin user for each approved college so they can login to College Dashboard
        if c_data["status"] == "approved":
            college_admin_email = f"admin@{c_data['domain']}"
            UserModel.create(
                name=f"{c_data['name']} Admin",
                email=college_admin_email,
                password="password123",
                role="college"
            )
            # update college_id manually since create doesn't accept it
            db.users.update_one({"email": college_admin_email}, {"$set": {"college_id": str(college["_id"])}})
            print(f"  -> Created college admin: {college_admin_email} / password123")

    # 2. Create Students
    skills = ["Python", "React", "Data Structures", "Machine Learning", "Figma", "DevOps", "Java", "C++", "UI/UX", "Node.js"]
    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
    last_names = ["Doe", "Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson"]

    print("Creating Students...")
    for i in range(15):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        domain = random.choice(colleges_data)["domain"]
        email = f"{fname.lower()}.{lname.lower()}{i}@{domain}"
        
        # Determine college id based on domain
        assigned_college = next((c for c in colleges_data if c["domain"] == domain), None)
        assigned_college_entry = db.colleges.find_one({"domain": domain})
        c_id = str(assigned_college_entry["_id"]) if assigned_college_entry else None

        user = UserModel.create(
            name=f"{fname} {lname}",
            email=email,
            password="password123",
            role="student"
        )
        
        # Pick 2-3 offered skills and 2-3 wanted
        offered = random.sample(skills, random.randint(2, 3))
        wanted = random.sample([s for s in skills if s not in offered], random.randint(2, 3))
        
        # Update user with skills and college_id
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "skillsOffered": offered,
                "skillsWanted": wanted,
                "college_id": c_id,
                "status": "active" if random.random() > 0.1 else "blacklisted" # 10% blacklisted
            }}
        )
        print(f"Created student: {email} | Skills Offered: {offered} | College ID: {c_id}")

    # Guaranteed Matches for Testing
    stanford_entry = db.colleges.find_one({"domain": "stanford.edu"})
    if stanford_entry:
        stanford_id = str(stanford_entry["_id"])
        
        user1 = UserModel.create(name="Test Match One", email="test1@stanford.edu", password="password123", role="student")
        db.users.update_one({"_id": user1["_id"]}, {"$set": {"skillsOffered": ["Python"], "skillsWanted": ["React"], "college_id": stanford_id, "status": "active"}})

        user2 = UserModel.create(name="Test Match Two", email="test2@stanford.edu", password="password123", role="student")
        db.users.update_one({"_id": user2["_id"]}, {"$set": {"skillsOffered": ["React"], "skillsWanted": ["Java"], "college_id": stanford_id, "status": "active"}})
        
        print("\nCreated guaranteed matching users for testing!")
        print("-> test1@stanford.edu / password123")
        print("-> test2@stanford.edu / password123")

    print("\nDummy data population complete!")
if __name__ == "__main__":
    populate_dummy_data()
