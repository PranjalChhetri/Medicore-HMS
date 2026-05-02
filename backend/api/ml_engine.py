"""
ml_engine.py — Lightweight ML/AI logic for MediCore HMS
Uses scikit-learn trained on synthetic data (no external training time needed).
Three modules:
  1. readmission_risk(patient_data) → float 0-1
  2. smart_schedule(doctor, date, existing_appointments) → suggested slots
  3. inventory_alerts(items) → list of items needing reorder
"""

import random
import math
from datetime import datetime, timedelta
import os
import joblib
import numpy as np

# ─────────────────────────────────────────────────────────────────────────────
# Load all trained disease models and scalers
# ─────────────────────────────────────────────────────────────────────────────

# Heart Disease
heart_model_path = os.path.join(os.path.dirname(__file__), 'heart_disease_nn_model.pkl')
heart_model = joblib.load(heart_model_path) if os.path.exists(heart_model_path) else None

# Breast Cancer
breast_model_path = os.path.join(os.path.dirname(__file__), 'breast_cancer_nn_model.pkl')
breast_model = joblib.load(breast_model_path) if os.path.exists(breast_model_path) else None

# Diabetes
diabetes_model_path = os.path.join(os.path.dirname(__file__), 'diabetes_nn_model.pkl')
diabetes_scaler_path = os.path.join(os.path.dirname(__file__), 'diabetes_scaler.pkl')
diabetes_model = joblib.load(diabetes_model_path) if os.path.exists(diabetes_model_path) else None
diabetes_scaler = joblib.load(diabetes_scaler_path) if os.path.exists(diabetes_scaler_path) else None

# Kidney Disease (Chronic Kidney Disease)
kidney_model_path = os.path.join(os.path.dirname(__file__), 'kidney_disease_nn_model.pkl')
kidney_scaler_path = os.path.join(os.path.dirname(__file__), 'kidney_disease_scaler.pkl')
kidney_model = joblib.load(kidney_model_path) if os.path.exists(kidney_model_path) else None
kidney_scaler = joblib.load(kidney_scaler_path) if os.path.exists(kidney_scaler_path) else None

# Liver Disease
liver_model_path = os.path.join(os.path.dirname(__file__), 'liver_disease_nn_model.pkl')
liver_scaler_path = os.path.join(os.path.dirname(__file__), 'liver_disease_scaler.pkl')
liver_model = joblib.load(liver_model_path) if os.path.exists(liver_model_path) else None
liver_scaler = joblib.load(liver_scaler_path) if os.path.exists(liver_scaler_path) else None


# ─────────────────────────────────────────────────────────────────────────────
# 1. READMISSION / DISEASE RISK  (rule-weighted scoring, sklearn-style)
# ─────────────────────────────────────────────────────────────────────────────

# Condition severity weights (evidence-based heuristics)
CONDITION_WEIGHTS = {
    'heart disease':  0.85,
    'cardiac':        0.82,
    'stroke':         0.80,
    'cancer':         0.78,
    'diabetes':       0.60,
    'hypertension':   0.55,
    'obesity':        0.45,
    'asthma':         0.40,
    'thyroid':        0.35,
    'anemia':         0.30,
    'pneumonia':      0.65,
}


def readmission_risk(patient_data: dict) -> dict:
    """
    Predict 30-day readmission risk for a patient.
    Returns: { risk_score: float (0-100), risk_label: str, factors: list }
    """
    score = 0.0
    factors = []

    age = int(patient_data.get('age', 30))
    condition = str(patient_data.get('condition', '')).lower()
    gender = str(patient_data.get('gender', '')).lower()

    # Age factor
    if age >= 75:
        score += 30; factors.append('Advanced age (≥75)')
    elif age >= 60:
        score += 20; factors.append('Older age (60-74)')
    elif age >= 45:
        score += 10

    # Condition factor
    matched = False
    for cond, weight in CONDITION_WEIGHTS.items():
        if cond in condition:
            score += weight * 50
            factors.append(f'Chronic condition: {condition.title()}')
            matched = True
            break
    if not matched and condition:
        score += 10

    # Gender (slight statistical difference)
    if gender == 'male' and age >= 50:
        score += 5

    # Clamp and normalise
    score = min(score, 100)

    if score >= 70:
        label = 'High'
    elif score >= 40:
        label = 'Moderate'
    else:
        label = 'Low'

    return {
        'risk_score': round(score, 1),
        'risk_label': label,
        'factors': factors or ['No significant risk factors identified'],
    }


def disease_risk(patient_data: dict, disease: str = 'heart') -> dict:
    """
    Predict disease risk using trained ML neural network models.
    Supports: heart, breast, diabetes, kidney, liver
    Returns: { risk_score: float (0-100), risk_label: str, probability: float }
    """
    model = None
    scaler = None
    features = []
    disease_lower = disease.lower().strip()

    if disease_lower == 'heart':
        model = heart_model
        # Gender: convert string to numeric if needed (1 = male, 0 = female)
        gender_val = patient_data.get('gender', 0)
        if isinstance(gender_val, str):
            gender_val = 1 if gender_val.lower() == 'male' else 0
        
        features = [
            patient_data.get('age', 50),
            gender_val,
            patient_data.get('cp', 0),
            patient_data.get('trestbps', 120),
            patient_data.get('chol', 200),
            patient_data.get('fbs', 0),
            patient_data.get('restecg', 0),
            patient_data.get('thalach', 150),
            patient_data.get('exang', 0),
            patient_data.get('oldpeak', 0.0),
            patient_data.get('slope', 1),
            patient_data.get('ca', 0),
            patient_data.get('thal', 3),
        ]
        
    elif disease_lower == 'breast':
        model = breast_model
        features = [
            patient_data.get('clump_thickness', 1),
            patient_data.get('uniformity_cell_size', 1),
            patient_data.get('uniformity_cell_shape', 1),
            patient_data.get('marginal_adhesion', 1),
            patient_data.get('single_epithelial_cell_size', 1),
            patient_data.get('bare_nuclei', 1),
            patient_data.get('bland_chromatin', 1),
            patient_data.get('normal_nucleoli', 1),
            patient_data.get('mitoses', 1),
        ]
        
    elif disease_lower == 'diabetes':
        model = diabetes_model
        scaler = diabetes_scaler
        features = [
            patient_data.get('pregnancies', 0),
            patient_data.get('glucose', 100),
            patient_data.get('blood_pressure', 70),
            patient_data.get('skin_thickness', 20),
            patient_data.get('insulin', 80),
            patient_data.get('bmi', 25.0),
            patient_data.get('diabetes_pedigree', 0.5),
            patient_data.get('age', 30),
        ]
        
    elif disease_lower == 'kidney' or disease_lower == 'kidney disease':
        model = kidney_model
        scaler = kidney_scaler
        # Use common kidney disease indicators
        features = [
            patient_data.get('age', 50),
            patient_data.get('blood_pressure_systolic', 120),
            patient_data.get('blood_pressure_diastolic', 80),
            patient_data.get('glucose', 100),
            patient_data.get('blood_urea_nitrogen', 20),
            patient_data.get('serum_creatinine', 1.2),
            patient_data.get('sodium', 140),
            patient_data.get('potassium', 4.5),
        ]
        
    elif disease_lower == 'liver' or disease_lower == 'liver disease':
        model = liver_model
        scaler = liver_scaler
        # Indian Liver Patient Dataset features
        features = [
            patient_data.get('age', 45),
            patient_data.get('total_bilirubin', 0.8),
            patient_data.get('direct_bilirubin', 0.2),
            patient_data.get('alkaline_phosphatase', 75),
            patient_data.get('alamine_aminotransferase', 35),
            patient_data.get('aspartate_aminotransferase', 35),
            patient_data.get('total_protiens', 6.5),
            patient_data.get('albumin', 3.5),
        ]
        
    else:
        return {
            'risk_score': 50,
            'risk_label': 'Unknown',
            'probability': 0.5,
            'note': f'Model not available for disease: {disease}. Supported: heart, breast, diabetes, kidney, liver'
        }

    if model is None:
        return {
            'risk_score': 50,
            'risk_label': 'Unknown',
            'probability': 0.5,
            'note': f'Model not loaded for {disease}. Train the model first by running train_model.py'
        }

    # Apply scaler if available (for diabetes, kidney, liver)
    if scaler is not None:
        features = scaler.transform([features])[0]
    else:
        features = np.array(features)

    # Predict
    prediction = model.predict([features])[0]
    probability = model.predict_proba([features])[0][1]

    risk_score = probability * 100
    if risk_score >= 70:
        label = 'High'
    elif risk_score >= 40:
        label = 'Moderate'
    else:
        label = 'Low'

    return {
        'risk_score': round(risk_score, 1),
        'risk_label': label,
        'probability': round(probability, 3),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. SMART APPOINTMENT SCHEDULING
# ─────────────────────────────────────────────────────────────────────────────

CLINIC_HOURS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]


def smart_schedule(doctor_name: str, preferred_date: str, existing_appointments: list) -> dict:
    """
    Suggest optimal appointment slots for a doctor on a given date.
    Returns: { available_slots: list, suggested_slot: str, conflicts: list, load_score: float }
    """
    # Filter appointments for this doctor on this date
    booked = [
        a['time'] for a in existing_appointments
        if a.get('doctor') == doctor_name
        and str(a.get('date', '')) == preferred_date
        and a.get('status') != 'Cancelled'
    ]

    available = [s for s in CLINIC_HOURS if s not in booked]
    conflicts  = booked

    # Load score: what % of slots are taken
    load_score = round(len(booked) / len(CLINIC_HOURS) * 100, 1)

    # Suggest: first available slot, prefer morning
    suggested = available[0] if available else None

    # If doctor is overloaded (>70%), warn
    overloaded = load_score >= 70

    return {
        'available_slots': available,
        'booked_slots':    conflicts,
        'suggested_slot':  suggested,
        'load_score':      load_score,
        'overloaded':      overloaded,
        'message': (
            f"⚠️ Dr. {doctor_name} has {load_score}% schedule load on this date. Consider another date."
            if overloaded else
            f"✅ {len(available)} slots available. Suggested: {suggested or 'None'}"
        )
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. INVENTORY AUTO-REORDER ALERTS (trend + threshold detection)
# ─────────────────────────────────────────────────────────────────────────────

# Category-specific reorder thresholds (min safe quantity)
CATEGORY_THRESHOLDS = {
    'Medicine':    20,
    'PPE':         15,
    'Equipment':    3,
    'Supplies':    10,
    'Consumables': 25,
}

# Priority multipliers by category
CATEGORY_PRIORITY = {
    'Medicine':    1.5,
    'PPE':         1.3,
    'Equipment':   1.0,
    'Supplies':    1.2,
    'Consumables': 1.1,
}


def inventory_alerts(items: list) -> dict:
    """
    Analyse inventory items and return reorder alerts with priority scores.
    Returns: { alerts: list, critical_count: int, total_alerts: int }
    """
    alerts = []

    for item in items:
        qty      = int(item.get('quantity', 0))
        category = str(item.get('category', 'Supplies'))
        name     = str(item.get('name', ''))
        status   = str(item.get('status', ''))

        threshold = CATEGORY_THRESHOLDS.get(category, 10)
        priority  = CATEGORY_PRIORITY.get(category, 1.0)

        # Score: how urgently reorder is needed (0-100)
        if qty == 0:
            urgency = 100
            alert_type = 'CRITICAL'
        elif status == 'Critical' or qty < threshold * 0.3:
            urgency = 90
            alert_type = 'CRITICAL'
        elif status == 'Low Stock' or qty < threshold:
            urgency = round(60 + (1 - qty / threshold) * 30, 1)
            alert_type = 'LOW'
        else:
            continue   # No alert needed

        suggested_reorder = max(threshold * 5, 50)

        alerts.append({
            'item_id':          item.get('id'),
            'name':             name,
            'category':         category,
            'current_qty':      qty,
            'unit':             item.get('unit', 'units'),
            'alert_type':       alert_type,
            'urgency_score':    round(urgency * priority, 1),
            'suggested_reorder': suggested_reorder,
            'supplier':         item.get('supplier', 'Unknown'),
            'message': (
                f"🚨 {name} is OUT OF STOCK. Immediate reorder of {suggested_reorder} {item.get('unit','units')} required."
                if qty == 0 else
                f"⚠️ {name} is critically low ({qty} {item.get('unit','units')}). Reorder {suggested_reorder} units from {item.get('supplier','supplier')}."
                if alert_type == 'CRITICAL' else
                f"📦 {name} stock is low ({qty} {item.get('unit','units')}). Consider reordering from {item.get('supplier','supplier')}."
            )
        })

    # Sort by urgency
    alerts.sort(key=lambda x: x['urgency_score'], reverse=True)
    critical_count = sum(1 for a in alerts if a['alert_type'] == 'CRITICAL')

    return {
        'alerts':         alerts,
        'critical_count': critical_count,
        'total_alerts':   len(alerts),
        'summary': (
            f"🚨 {critical_count} critical + {len(alerts)-critical_count} low-stock items need attention."
            if alerts else
            "✅ All inventory levels are healthy. No reorders needed."
        )
    }
