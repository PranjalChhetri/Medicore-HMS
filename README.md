# 🏥 MediCore HMS — Hospital Management System

## ⚡ Quick Start (2 steps)

### Step 1 — Start the backend
Double-click `START_BACKEND.bat`

It will automatically:
- Install `django` and `django-cors-headers`
- Run all database migrations
- Seed sample patients, doctors, inventory, billing, appointments
- Run ML risk scoring on all patients
- Start the server at http://127.0.0.1:8000

### Step 2 — Open the frontend
Open `index.html` in your browser:
- **Recommended:** Use VS Code Live Server (right-click → Open with Live Server)
- **Quick:** Just double-click `index.html`

The frontend auto-detects the backend and syncs data on load.

---

## 📁 Project Structure

```
medicore_hms/
├── index.html                  ← Open this in browser
├── START_BACKEND.bat           ← Double-click to start backend
├── static/
│   ├── css/styles.css
│   └── js/
│       ├── data.js             (localStorage DB layer)
│       ├── api.js              (backend sync layer)
│       ├── app.js / router.js / utils.js
│       └── pages/
│           ├── dashboard.js
│           ├── patients.js
│           ├── doctors.js
│           ├── appointments.js ← Smart scheduling AI
│           ├── inventory.js    ← ML reorder alerts
│           ├── billing.js
│           ├── prediction.js   ← Claude AI prediction
│           └── analytics.js
└── backend/
    ├── manage.py
    ├── backend/settings.py
    └── api/
        ├── models.py           (Patient, Doctor, Appointment, Inventory, Billing)
        ├── views.py            (All REST endpoints)
        ├── urls.py             (URL routing)
        ├── ml_engine.py        (ML: risk, scheduling, alerts)
        ├── admin.py
        └── management/commands/seed_db.py
```

---

## 🤖 AI / ML Features

| Feature | How to use |
|---|---|
| **Disease Risk Prediction** | AI Prediction page → select disease → fill form → Run Assessment |
| **Patient Readmission Risk** | Auto-scored on every patient (Low/Moderate/High) |
| **Smart Appointment Scheduling** | Schedule appointment → pick doctor + date → AI suggests free slots |
| **Inventory Auto-Reorder Alerts** | Inventory page → click "🤖 ML Reorder Alerts" |

---

## 🔌 API Endpoints

| Method | URL | Description |
|---|---|---|
| GET/POST | `/api/patients/` | List / create patients |
| GET/PUT/DELETE | `/api/patients/<id>/` | Patient detail |
| GET | `/api/patients/<id>/risk/` | ML readmission risk |
| GET/POST | `/api/doctors/` | Doctors |
| GET/POST | `/api/appointments/` | Appointments |
| POST | `/api/appointments/suggest/` | Smart slot suggestions |
| GET/POST | `/api/inventory/` | Inventory |
| GET | `/api/inventory/alerts/` | ML reorder alerts |
| GET/POST | `/api/billing/` | Billing |
| GET | `/api/dashboard/stats/` | Aggregated stats |

---

## ⚙️ Requirements
- Python 3.8+ (you have 3.14 ✅)
- pip packages: `django`, `django-cors-headers` (auto-installed by .bat)
- Browser with JavaScript enabled
