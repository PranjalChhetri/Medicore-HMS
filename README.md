# 🏥 Medicore-HMS — AI-Powered Hospital Management System

Medicore-HMS is an AI-driven Hospital Management System designed to combine predictive healthcare intelligence with hospital workflow automation. Unlike traditional HMS platforms, it integrates machine learning models trained on patient records, clinical history, lab reports, and symptom-based datasets to enable early disease prediction, patient risk assessment, and data-driven healthcare decision-making.

The system’s predictive analytics engine uses machine learning algorithms to identify disease patterns, classify patient risk levels, and generate preliminary health insights. By analyzing historical patient records, vital signs, and clinical parameters, Medicore-HMS helps detect high-risk conditions such as diabetes, cardiovascular disease, and hypertension before they become critical.

The AI pipeline includes data preprocessing, feature engineering, model training, validation, and real-time inference to support smarter clinical decisions.

---

## 🤖 AI / ML Features

* Disease Risk Prediction
* Patient Readmission Risk Analysis
* Smart Appointment Scheduling
* Inventory Auto-Reorder Prediction
* Real-Time Predictive Analytics Dashboard

### AI Workflow

* Data Collection from patient records and lab reports
* Data Cleaning and Preprocessing
* Feature Engineering
* Model Training
* Model Validation (Accuracy, Precision, Recall, F1-score)
* Real-Time Risk Prediction

---

## 🚀 Quick Start

### Step 1 — Start Backend

Double-click `START_BACKEND.bat`

It will automatically:

* Install dependencies
* Run migrations
* Seed sample data
* Run ML risk scoring
* Start backend server

Backend runs at:

`http://127.0.0.1:8000`

---

### Step 2 — Open Frontend

Open `index.html`

Recommended:

Use Live Server in Visual Studio Code

---

## 🛠 Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Django
* Django REST Framework

### Database

* MySQL

### AI/ML

* Scikit-learn
* TensorFlow
* Pandas
* NumPy

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

## 📈 Impact

Medicore-HMS transforms hospital management into a predictive intelligence platform by integrating machine learning for early disease detection, patient risk profiling, and intelligent healthcare analytics.

This enables proactive treatment planning, improves operational efficiency, reduces emergency cases, and supports data-driven medical decisions.

---

## 🔮 Future Enhancements

* Deep Learning Disease Models
* IoT-Based Monitoring
* Telemedicine Support
* AI Chatbot Integration
* Mobile Application Support
* Cloud Deployment

