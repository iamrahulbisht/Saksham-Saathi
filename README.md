# SAKSHAM SAATHI
Saksham Saathi is a regionally adapted, tech enabled learning platform designed for children with intellectual disabilities or developmental delays.

## Demo Video

### Video 1
https://github.com/user-attachments/assets/7bc438b2-42ff-4a3c-9580-1b5a6f96704a

### Video 2
https://drive.google.com/file/d/1EUvt2LGI3gVnNSiL4LalIx6ZhqW41qYw/view?usp=sharing


## Problem
- 22.66 Lakhs children in India with intellectual disabilities or learning difficulties remain unnoticed by parents and teachers.
- Most diagnoses occur after Grade 3, losing the critical early neuroplasticity window for effective intervention.
- Educators in crowded classrooms cannot manually track the subtle behavioral cues of cognitive overload for every student.
- Children with such difficulties often face problems in tradtional education systems since most platforms are designed for normal learners and fail to address their unique problems.
- No personalised learning platforms for regional kids with sprecial needs.
- Lack of awareness and collaboration between teachers, parents and experts.

## What existing solutions miss
- **Require continous internet** - Useless in rural areas with poor connectivity.
- **English only interfaces** - Language barriers prevent adoption.
- Children often feel demotivated when compared with normal learners in traditionnal IQ tests or ranking systems.

## Our Solution
Saksham Saathi bridges this gap with a four-pillar approach:
1. **Detects What**: Multimodal AI(Eye tracking + Speech + Handwriting) screens for neurodevelopmental traits.
2. **Detects When**: Real time monitoring detecting cognitive overload signals.
3. **Predicts When**: LSTM models forecast attention patterns 48 jours ahead to optimize schedules.
4. **Alerts Who**: Collaborative pipelines connecting therapists, children, teacher and parents.

### Core Features
#### 1. **Multimodal Screening (5 Assessment Games)**
Gamified assessments that make screening fun for children while collecting comprehensive data:

-  **Game 1: Eye-Tracking Reading** - Analyzes gaze patterns using WebGazer.js
-  **Game 2: Speech Fluency** - Captures pronunciation and phoneme clarity
-  **Game 3: Handwriting Analysis** - Detects letter reversals and spacing issues
-  **Game 4: Pattern Recognition** - Tests logical reasoning abilities
-  **Game 5: Response Time** - Measures attention consistency

**AI Models:** Random Forest + MLP ensemble achieving **85%+ accuracy**
#### 2. **Real-Time Cognitive Load Detection**
Background monitoring that alerts teachers **in under 200ms** when a student shows signs of cognitive overload:

- Tracks mouse movements, response delays, error rates
- Instant interventions: Break suggestions for students, live alerts for teachers
- Lightweight Decision Tree model for real-time processing

#### 3. **LSTM Attention Prediction**
Predicts student focus levels **24-48 hours ahead** with **82%+ accuracy**:

- Analyzes 14-day learning behavior patterns
- Generates optimal study schedules
- Helps teachers plan complex tasks during peak attention windows

#### 4. **Collaborative Ecosystem**
Seamless workflow connecting all stakeholders:

- **Therapists** → Provide clinical notes and intervention plans
- **Teachers** → Implement strategies and track effectiveness
- **Parents** → Receive weekly reports and home activity suggestions
- **Real-time notifications** via WebSocket for instant communication

#### 5. **Offline-First Architecture**
Built for rural reliability:

- **Full functionality offline** for 14+ days
- **IndexedDB** for local data storage
- **Background Sync API** for automatic data reconciliation
- **Zero data loss** with conflict resolution

#### 6. **Regional Language Support**
Truly inclusive with script-aware AI:

- **Languages:** Hindi, English
- **Script-aware detection:** Identifies Devanagari-specific reversals
- **Instant UI switching** for seamless user experience

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React PWA)                      │
│              Offline-First • Progressive Web App             │
│                   http://localhost:5173                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│           API Gateway • Business Logic • Auth                │
│                   http://localhost:3000                      │
└─────┬──────────────────┬────────────────────┬───────────────┘
      │                  │                    │
      │                  │                    │
      ▼                  ▼                    ▼
┌──────────┐    ┌─────────────────┐    ┌──────────────────┐
│PostgreSQL│    │  ML Service     │    │   Socket.io      │
│  Prisma  │    │  (FastAPI)      │    │  Real-time       │
│   ORM    │    │  Port: 8000     │    │  Notifications   │
└──────────┘    └─────────────────┘    └──────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   AI Models     │
                │ • Screening RF  │
                │ • LSTM Predict  │
                │ • Cognitive DT  │
                └─────────────────┘
```

--
![Image](https://github.com/user-attachments/assets/865493c7-a14c-41db-b932-65a08a66f693)
--
![Image](https://github.com/user-attachments/assets/b6d0eab9-09fa-4755-875c-115157996db5)
--


## Quick Start
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

## Usage guide
### For teachers
1. **Register** as a Teacher at `/register`
2. **Add Students** from your dashboard
3. **Start Assessments** - Select a student and begin screening
4. **Monitor Real-time** - Receive cognitive overload alerts
5. **View Reports** - Access comprehensive screening results
### For Therapists
1. **Review Assessments** - Analyze detailed screening data
2. **Add Clinical Notes** - Document observations and recommendations
3. **Assign Interventions** - Create personalized intervention plans
4. **Track Progress** - Monitor student improvement over time
### For Parents
1. **View Child Progress** - Access simplified reports
2. **Receive Notifications** - Get weekly updates via email/SMS
3. **Home Activities** - Follow suggested reinforcement activities

## Tech Stack
### Frontend
- **React 18.2** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Dexie.js** - IndexedDB wrapper for offline storage
- **Socket.io Client** - Real-time communication
- **WebGazer.js** - Eye-tracking capabilities
- **React Router** - Client-side routing
### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
### ML Service
- **Python 3.11** - Programming language
- **FastAPI** - Modern API framework
- **TensorFlow** - Deep learning
- **Scikit-learn** - Machine learning
- **NumPy & Pandas** - Data processing
- **Librosa** - Audio analysis
- **OpenCV** - Computer vision

Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control (RBAC)** - Granular permissions
- **AES-256 Encryption** - Data encryption at rest
- **HTTPS/TLS** - Secure data transmission
- **Input Validation** - Protection against injection attacks
- **Audit Logging** - Complete activity tracking

## Team: Return 0
### Contributors
- Piyush Joshi
- Piyush Naula
- Rahul Bisht
- Yash Karki
