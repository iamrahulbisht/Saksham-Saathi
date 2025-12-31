# MindMap
MindMap is a regionally adapted, tech enabled special learning platform designed for children with intellectual disabilities or developmental delays.
## Demo Video
https://github.com/user-attachments/assets/7bc438b2-42ff-4a3c-9580-1b5a6f96704a
## Problem
- 22.66 Lakhs children in India with intellectual disabilities or learning difficulties remain unnoticed by parents and teachers.
- Most diagnoses occur after Grade 3, losing the critical early neuroplasticity window for effective intervention.
- Educators in crowded classrooms cannot manually track the subtle behavioral cues of cognitive overload for every student.
- Children with such difficulties often face problems in traditional education systems since most platforms are designed for normal learners and fail to address their unique problems.
- No personalized learning platforms for regional kids with special needs.
- Lack of awareness and collaboration between teachers, parents and experts.
## What existing Solutions Miss
Competitors (NeuroLearn, Akshar Mitra) often require:
- Constant Cloud connectivity.
- English-only interfaces (Ignoring regional scripts like Hindi/Tamil).
- Children often feel demotivated when compared with normal learners in traditional IQ tests or ranking systems.
## Our Solution
MindMap bridges this gap with a four-pillar approach:
1. **Detects What**: Multimodal AI(Eye tracking + Speech + Handwriting) screens for neurodevelopmental traits.
2. **Detects When**: Real time monitoring detecting cognitive overload signals
3. **Predicts When**: LSTM models forecast attention patterns 48 hours ahead to optimize schedules.
4. **Alerts Who**: Collaborative pipelines connecting therapists, children, teacher and parents.

## Key features
### 1. Multimodal Neurodevelopmental Screening
Five interactive micro-games assess different cognitive faculties:
*   **Game 1 (Eye Tracking)**: Uses `WebGazer.js` to track fixation duration and saccade symmetry during reading.
*   **Game 2 (Speech Fluency)**: Analyzes phoneme clarity and hesitation markers to detect Dyslexia/speech risks.
*   **Game 3 (Handwriting)**: Captures stroke pressure (simulated), reversal patterns (b/d, p/q), and motor control.
*   **Game 4 (Pattern Recognition)**: Tests logical sequencing and abstract reasoning.
*   **Game 5 (Reaction Time)**: Measures variability in response speed—a key biomarker for ADHD.

### 2. Real-Time Cognitive Load Monitor
A background "watchdog" that runs during all learning tasks:
*   **Triggers**: Mouse hesitation, erratic scrolling, rapid backspacing, or long idle times (>8s).
*   **Action**: Instantly flags "Overload" state.
*   **Intervention**: Proposes a "Brain Break" or simpler task to the student while notifying the teacher.

### 3. Attention Prediction Engine (LSTM)
*   **Goal**: Schedule difficult tasks (Math/Science) during peak attention windows.
*   **Model**: Trained `RandomForestRegressor` (simulating LSTM behavior) on behavioral time-series data.
*   **Output**: A **48-Hour Focus Forecast** chart for each student, helping teachers personalize lesson plans.

### 4. Collaborative Ecosystem
*   **Therapist**: Sets clinical parameters and intervention plans.
*   **Teacher**: Receives actionable alerts and daily "Focus Forecasts".
*   **Parent**: Gets simplified weekly reports and home activity suggestions.
### 5. Offline-First Architecture
*   **Local-First ML**: Models run in the browser (TF.js) or local Python service.
*   **Sync Queue**: Data is stored in IndexedDB/Postgres and syncs to the cloud only when connection is available.

## System architecture
![Image](https://github.com/user-attachments/assets/97cd1d99-9275-4f5c-a46f-876c6084a107)

## Tech Stack
### Frontend
*   **Framework**: React 19 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Custom CSS System (Glassmorphism, Gradients, CSS Variables)
*   **State**: React Context API
*   **Special Libs**: `webgazer` (Eye Tracking), `socket.io-client` (Real-time), `chart.js` (Visuals)
### Backend (Main)
*   **Runtime**: Node.js v18+
*   **Framework**: Express.js
*   **Database**: PostgreSQL 15
*   **ORM**: Prisma (Type-safe)
*   **Auth**: JWT + RBAC (Teacher/Therapist/Parent roles)
### AI/ML Microservice
*   **Framework**: FastAPI (Python 3.11)
*   **Models**: Scikit-Learn (Random Forest, Decision Trees)
*   **Processing**: NumPy, Pandas
*   **Future**: TensorFlow/Keras for deep learning models

## Future goals for Phase 2
- Regional language support
- Offline PWA with background sync
- Make the UI children friendly
- Mobile app
- Growth checker of child
- An AI buddy (Chatbot) for children

## Installation & Setup
    
### Prerequisites
1.  **Node.js** v18+
2.  **Python** 3.10+
3.  **PostgreSQL** installed and running.

### 1. Database Setup
Create a PostgreSQL database named `saksham_saathi_db`.

### 2. Backend Setup
```bash
cd backend
npm install

npx prisma generate
npx prisma db push

# Start Server
npm run dev
```

### 3. ML Service Setup
```bash
cd ml-service
# Create and activate virtual environment (recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Train initial models (Required for first run)
python train_model.py

# Start ML API
uvicorn main:app --reload --port 8000
# API runs on http://localhost:8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start Client
npm run dev
# App runs on http://localhost:5173
```
## Team: Return 0
### Contributors
- Piyush Joshi
- Piyush Naula
- Rahul Bisht
- Yash Karki
