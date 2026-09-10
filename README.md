# AI Payment Scam Detector

> **Hackathon-Ready AI System for Real-Time Payment Fraud Detection**

A full-stack AI application that detects payment scams before money moves, using a multi-layer pipeline: behavioral anomaly detection → rule-based heuristics → LightGBM machine learning → weighted decision synthesis.

---

## 🚀 Live Demo Flow

1. Open the **Landing Page** → see the system overview
2. Navigate to **Live Payment Simulator** → enter transaction details or pick a preset
3. Submit → the frontend calls `POST /api/analyze` on the FastAPI backend
4. **Risk Result page** displays: final score, risk level, decision (ALLOW / VERIFY / BLOCK), rule score, ML score, fraud probability, behavioral signals, and AI reasoning
5. Explore the **Analyst Dashboard** for fraud analytics and the **User Dashboard** for transaction history

---

## 🧠 AI Pipeline Architecture

```
Transaction Input
    ↓
Historical Transaction History (in-memory baseline)
    ↓
Behavioral Signal Extraction (9 signals)
    ↓
Rule-Based Risk Score (40% weight)   +   LightGBM ML Score (60% weight)
    ↓                                          ↓
              Weighted Decision Synthesis
    ↓
ALLOW / VERIFY / BLOCK
```

### Decision Thresholds
| Final Score | Risk Level | Decision |
|------------|------------|----------|
| 0 – 39     | LOW        | ALLOW    |
| 40 – 69    | MEDIUM     | VERIFY   |
| 70 – 100   | HIGH       | BLOCK    |

---

## 🗂 Project Structure

```
ai_payment_scam_detector/
├── backend/
│   ├── main.py           # FastAPI app + /api/analyze endpoint
│   ├── schemas.py        # Pydantic request/response models
│   ├── history.py        # In-memory transaction history store
│   ├── behavioral.py     # 9 behavioral signal extractors
│   ├── rules.py          # Heuristic rule engine (0-100 scoring)
│   ├── ml_model.py       # LightGBM model loader + inference
│   ├── decision.py       # Weighted risk decision synthesis
│   ├── model.joblib      # Trained LightGBM model
│   ├── requirements.txt  # Python dependencies
│   ├── test_phase4.py    # Phase 4 ML tests
│   ├── test_phase5.py    # Phase 5 decision synthesis tests
│   └── venv/             # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # React Router with all routes
│   │   ├── main.jsx              # React entry point
│   │   ├── index.css             # Global styles (Tailwind CSS v4)
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Responsive navigation bar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Hero, features, how-it-works, scenarios
│   │   │   ├── Login.jsx         # Firebase auth (sign in / sign up)
│   │   │   ├── Simulator.jsx     # Live payment form + preset scenarios
│   │   │   ├── RiskResult.jsx    # Dynamic risk result display
│   │   │   ├── UserDashboard.jsx # Transaction history dashboard
│   │   │   └── AnalystDashboard.jsx # Fraud analytics portal
│   │   └── services/
│   │       └── firebase.js       # Firebase auth configuration
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API: http://127.0.0.1:8000  
Swagger Docs: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## 🔌 API Reference

### Health Check
```
GET /
```
Returns backend status and version.

### Analyze Transaction
```
POST /api/analyze
Content-Type: application/json

{
  "amount": 25000,
  "recipient": "unknown@upi",
  "device": "New Device",
  "location": "Mumbai",
  "user_id": "user_101"
}
```

**Response includes:**
- `final_risk_score` — weighted composite score (0–100)
- `final_risk_level` — LOW / MEDIUM / HIGH
- `final_decision` — ALLOW / VERIFY / BLOCK
- `rule_score` — heuristic engine score (40% weight)
- `ml_score` — LightGBM score (60% weight)
- `reasons` — explainable AI reasoning list
- `behavioral_signals` — all 9 extracted behavioral features
- `ml_result` — probability, prediction label, model name

---

## 🧪 Test Scenarios

| Scenario | Amount | Recipient | Device | Location | Expected |
|----------|--------|-----------|--------|----------|----------|
| High Risk | ₹25,000 | unknown@upi | New Device | Mumbai | **BLOCK** |
| Low Risk | ₹500 | groceries@upi | My Phone | Chennai | **ALLOW** |
| Medium Risk | ₹20,000 | new_contact@upi | New Device | Mumbai | VERIFY |

### Run Backend Tests
```bash
cd ai_payment_scam_detector
backend\venv\Scripts\python.exe -m pytest backend/ -v
# 19/19 PASSED
```

### Build Frontend
```bash
cd frontend
npm run build
# ✓ built in ~441ms
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| UI Icons | Lucide React |
| Authentication | Firebase Auth |
| Backend | FastAPI (Python) |
| ML Model | LightGBM Classifier |
| Risk Logic | Custom rule engine + weighted decision |
| API Transport | REST JSON over HTTP |

---

## 🔒 Security Notes

- Firebase API keys in `frontend/src/services/firebase.js` are **public-facing client-side keys** (standard Firebase Web SDK practice — Firebase security is enforced by Firebase Security Rules, not by keeping keys secret)
- Backend has CORS enabled for `*` (all origins) — suitable for demo/hackathon use
- No sensitive credentials are stored in the backend

---

## 📊 Behavioral Signals Extracted

1. `is_unusual_amount` — amount vs historical average
2. `amount_multiplier` — ratio above baseline
3. `is_new_recipient` — first-time transfer target
4. `is_new_device` — unrecognized device string
5. `is_unusual_location` — geographic anomaly
6. `high_transaction_frequency` — velocity spike detection
7. `repeated_suspicious_behavior` — past anomaly pattern
8. `historical_transaction_count` — total transactions seen
9. `historical_average_amount` — rolling spending baseline

---

*Built for AI Hackathon — Multi-layer Payment Fraud Detection System*