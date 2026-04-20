import os
from dotenv import load_dotenv
from models.User import UserModel

# Load environment variables (like MongoDB URI)
load_dotenv()

def create_default_admin():
    email = "admin@stackmate.com"
    
    # Check if admin already exists
    existing = UserModel.find_by_email(email)
    if existing:
        print(f"Admin already exists with email: {email}")
        print("Ensuring role is admin...")
        from config.db import get_db
        db = get_db()
        db.users.update_one({"_id": existing["_id"]}, {"$set": {"role": "admin"}})
        print("Role updated to admin.")
        return

    print(f"Creating default admin '{email}'...")
    UserModel.create(
        name="System Admin",
        email=email,
        password="adminpassword123",
        role="admin"
    )
    print("Default admin created successfully! Email: admin@stackmate.com | Password: adminpassword123")

if __name__ == "__main__":
    create_default_admin()
