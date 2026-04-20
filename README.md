# 🚀 StackMate

StackMate is a premium skill-exchange platform designed for students. It facilitates the discovery and exchange of technical and creative skills like DSA, Web Development, UI/UX Design, and more.

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS (Premium Dark Theme)
- **Backend**: Flask (Python), MongoDB
- **Auth**: JWT (JSON Web Tokens), Bcrypt for password hashing

## 📂 Project Structure

```text
STACKMATE/
├── frontend/          # React + Vite frontend
│   ├── src/           # Components, Pages, Assets
│   └── ...
├── backend/           # Flask API
│   ├── models/        # Database schemas
│   ├── routes/        # API endpoints
│   ├── utils/         # Helper functions
│   └── app.py         # Entry point
└── ...
```

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd STACKMATE
```

### 2. Backend Setup (Flask)
Navigate to the backend directory and set up a virtual environment.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your MongoDB URL
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
```

Run the backend server:
```bash
python app.py
```

### 3. Frontend Setup (React)
Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 💡 How it Works

1. **Authentication**: Users can register and login securely. Passwords are hashed using Bcrypt, and sessions are managed via JWT.
2. **Skill Matching**: Users can list skills they have and skills they want to learn.
3. **Connect**: The platform helps students find matches based on their mutual interests.

## 📝 License
This project is for educational purposes.
..