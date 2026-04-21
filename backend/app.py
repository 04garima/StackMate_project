from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.waitlist import waitlist_bp
from routes.auth import auth_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for our frontend
CORS(app, resources={r"/*": {"origins": "*"}})

# Register default route
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to StackMate API!"})

# Register our sub-routes
app.register_blueprint(waitlist_bp, url_prefix="/api/waitlist")
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from routes.profile import profile_bp
from routes.match import match_bp
from routes.college import college_bp
from routes.admin import admin_bp
from routes.analytics import analytics_bp
from routes.chat import chat_bp
from routes.skills import skills_bp

app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(match_bp, url_prefix="/api/match")
app.register_blueprint(college_bp, url_prefix="/api/college")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
app.register_blueprint(chat_bp, url_prefix="/api/chat")
app.register_blueprint(skills_bp, url_prefix="/api/skills")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
