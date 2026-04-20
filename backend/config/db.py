from pymongo import MongoClient
import os

def get_db():
    mongo_uri = os.environ.get("MONGO_URI")
    client = MongoClient(mongo_uri)
    # Uses the database specified in the URI (mango_kcc)
    db = client.get_default_database()
    return db
