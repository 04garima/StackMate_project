from pymongo import MongoClient
import os

def get_db():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/mango_kcc")
    client = MongoClient(mongo_uri)
    try:
        db = client.get_default_database()
    except Exception:
        # Fallback if URI parsing doesn't provide default db
        db_name = mongo_uri.split('/')[-1].split('?')[0] or "mango_kcc"
        db = client[db_name]
    return db
