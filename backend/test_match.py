import sys
sys.path.append(".")
from models.User import UserModel
from routes.match import get_matches
from config.db import get_db

db = get_db()
user = db.users.find_one({"email": "test1@stanford.edu"})
if not user:
    print("User test1 not found!")
    exit(1)

my_offered = set(user.get("skillsOffered", []))
my_wanted = set(user.get("skillsWanted", []))
college_id = user.get("college_id")

print(f"My offered: {my_offered}, wanted: {my_wanted}, college: {college_id}")

other_users = list(db.users.find({
    "_id": {"$ne": user["_id"]},
    "college_id": college_id,
    "role": "student",
    "status": "active"
}))

print(f"Found {len(other_users)} other users in same college.")
for u in other_users:
    print(f" - {u.get('email')} : offered {u.get('skillsOffered')}, wanted {u.get('skillsWanted')}")
    their_offered = set(u.get("skillsOffered", []))
    their_wanted = set(u.get("skillsWanted", []))
    what_i_can_teach_them = my_offered.intersection(their_wanted)
    what_they_can_teach_me = my_wanted.intersection(their_offered)
    print(f"   what I teach: {what_i_can_teach_them}, what they teach: {what_they_can_teach_me}")

