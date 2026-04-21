import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to allow importing from models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from models.Skill import SkillModel

if __name__ == "__main__":
    print("Seeding default skills...")
    SkillModel.seed_default_skills()
    print("Skills seeded successfully!")
