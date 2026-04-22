import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv
from config.db import get_db

load_dotenv()

# We will use MongoDB 'ai_scores' collection for persistent caching

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
print(f"DEBUG: Initial API Key loaded: {'Yes' if api_key and 'your' not in api_key else 'No'}")

if api_key and "your" not in api_key:
    genai.configure(api_key=api_key)

def get_keyword_score(user1, user2):
    """
    Local fallback scoring algorithm based on keyword overlap.
    """
    def normalize(skills):
        if not skills: return set()
        result = set()
        for s in skills:
            if isinstance(s, str):
                for part in s.split(','):
                    clean = part.strip().lower()
                    if clean: result.add(clean)
        return result

    offered1 = normalize(user1.get("skillsOffered", []))
    wanted1 = normalize(user1.get("skillsWanted", []))
    offered2 = normalize(user2.get("skillsOffered", []))
    wanted2 = normalize(user2.get("skillsWanted", []))

    # Calculate overlaps
    i_get = wanted1.intersection(offered2)
    they_get = wanted2.intersection(offered1)

    score = 0
    reason_parts = []

    if i_get:
        score += len(i_get) * 25
        reason_parts.append(f"They offer {', '.join(list(i_get)[:2])} which you want")
    
    if they_get:
        score += len(they_get) * 15
        reason_parts.append(f"You offer {', '.join(list(they_get)[:2])} which they want")

    # Add bio similarity bonus (very simple)
    bio1 = user1.get("bio", "").lower()
    bio2 = user2.get("bio", "").lower()
    
    bio_overlap = 0
    for skill in list(offered1) + list(wanted1):
        if skill in bio2:
            bio_overlap += 5
    
    score += bio_overlap
    if bio_overlap > 0:
        reason_parts.append("Your skills align with their interests")

    # Cap score at 95 (leave 100 for perfect AI matches)
    final_score = min(score, 95)
    reason = " | ".join(reason_parts) if reason_parts else "Potential skill alignment"
    
    return {"score": final_score, "reason": reason + " (Fallback Scoring)"}

def calculate_match_score(user1, user2, force_ai=False):
    """
    Main entry point for scoring. Tries Gemini, falls back to keyword matching.
    """
    # Create a unique cache key (sorted to ensure consistency)
    u1_id = str(user1.get("_id", "unknown"))
    u2_id = str(user2.get("_id", "unknown"))

    db = get_db()
    
    # Check DB cache
    # Generate a skill-aware cache key
    # This ensures that if either user updates their skills, the cache is invalidated automatically.
    u1_skills = ",".join(sorted(user1.get("skillsOffered", []) + user1.get("skillsWanted", [])))
    u2_skills = ",".join(sorted(user2.get("skillsOffered", []) + user2.get("skillsWanted", [])))
    skill_fingerprint = f"{u1_skills}|{u2_skills}"
    
    # Cache key format: user1_user2_hashOfSkills
    import hashlib
    skills_hash = hashlib.md5(skill_fingerprint.encode()).hexdigest()[:10]
    cache_key = f"{u1_id}_{u2_id}_{skills_hash}"

    cached_data = db.ai_scores.find_one({"cache_key": cache_key})
    if cached_data:
        # Check if cache is still fresh (valid for 7 days)
        if time.time() - cached_data.get("timestamp", 0) < (86400 * 7):
            return {
                "score": cached_data["score"], 
                "reason": cached_data["reason"],
                "is_ai": True
            }

    # If we are NOT forcing AI and it's not in cache, return basic keyword score
    if not force_ai:
        res = get_keyword_score(user1, user2)
        res["is_ai"] = False
        return res

    current_key = os.getenv("GOOGLE_API_KEY")
    if not current_key or "your" in current_key:
        res = get_keyword_score(user1, user2)
        res["is_ai"] = False
        return res

    try:
        # Re-configure if needed
        genai.configure(api_key=current_key)
        
        # Define a humanized, casual "Peer Mentor" prompt
        prompt = f"""
        You are a friendly, cool peer mentor from StackMate. You're talking to a student who is looking for a learning partner. 
        Be casual, encouraging, and use a bit of personality!
        
        WHO'S INVOLVED:
        - The User (Student 1): Offers [{user1.get('skillsOffered')}], Wants [{user1.get('skillsWanted')}]. Bio: "{user1.get('bio')}"
        - The Peer (Student 2): {user2.get('name')}. Offers [{user2.get('skillsOffered')}], Wants [{user2.get('skillsWanted')}]. Bio: "{user2.get('bio')}"
        
        TASK:
        Give them the lowdown on why this match is awesome. Don't be a robot—talk to them like a friend who's excited for them!
        
        RESPONSE FORMAT (JSON):
        {{
          "score": (0-100),
          "reason": "🔥 Why this is cool: [Your casual take on their synergy] \n\n🤝 My advice: [A friendly tip on what they should do first] \n\n✨ The Vibe: [A punchy, supportive closing sentence]"
        }}
        
        RULES:
        1. Keep it real. No corporate speak.
        2. Use emojis like 🔥, 🙌, 💻, or 🚀.
        3. Explain the "Aha!" moment—why their skills actually fit.
        4. Focus on the value of the connection, not just a list of words.
        5. Use '\n\n' for spacing.
        6. IMPORTANT: Return valid JSON only. Do not use raw newlines inside the JSON values.
        """
        # (Total words: ~50-60)

        # Priority: User confirmed 'flash-latest' works best
        models_to_try = [
            'gemini-flash-latest',
            'gemini-2.5-flash', 
            'gemini-2.0-flash', 
            'gemini-1.5-flash'
        ]
        
        for model_name in models_to_try:
            try:
                # Mandatory delay for Free Tier
                time.sleep(3.0) 
                
                print(f"DEBUG: Attempting model {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                if response: 
                    print(f"DEBUG: Success with {model_name}")
                    break
            except Exception as model_err:
                err_msg = str(model_err)
                print(f"Model {model_name} failed: {err_msg[:80]}...")
                
                if "429" in err_msg:
                    print("Rate limit hit. Waiting 10 seconds...")
                    time.sleep(10)
                continue
        
        if not response:
            # Diagnostic: List available models if all failed
            print("DIAGNOSTIC: Listing available models for your API Key...")
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        print(f" - {m.name}")
            except: pass
            raise Exception("All Gemini models failed. Check console for available models.")
        
        if not response:
            raise Exception("All Gemini models failed (likely due to quota or region).")

        text = response.text.strip()
        
        # Robust JSON extraction
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        # Sanitize control characters that break JSON (like raw line breaks inside strings)
        # We replace actual newlines with the literal \n string if they are likely inside a JSON value
        sanitized_text = ""
        in_string = False
        for char in text:
            if char == '"':
                in_string = not in_string
            if in_string and char == '\n':
                sanitized_text += "\\n"
            elif ord(char) >= 32 or char in "\n\r\t": # Keep printable and standard whitespace
                sanitized_text += char
        
        result = json.loads(sanitized_text)
        
        # Save to DB cache
        final_result = {
            "cache_key": cache_key,
            "score": result.get("score", 0),
            "reason": result.get("reason", "AI identified a match."),
            "timestamp": time.time(),
            "user_ids": [u1_id, u2_id]
        }
        db.ai_scores.update_one(
            {"cache_key": cache_key},
            {"$set": final_result},
            upsert=True
        )
        
        return {
            "score": final_result["score"],
            "reason": final_result["reason"],
            "is_ai": True
        }
        
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        res = get_keyword_score(user1, user2)
        res["is_ai"] = False
        return res
