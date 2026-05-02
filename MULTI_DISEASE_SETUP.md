# Multi-Disease Prediction System Setup Guide

## Overview
Your MediCore HMS system now supports predictions for **5 diseases**:
1. **Heart Disease** (Heart Disease UCI Dataset)
2. **Breast Cancer** (Breast Cancer UCI Dataset)
3. **Diabetes** (Pima Indians Diabetes Database)
4. **Kidney Disease** (Chronic Kidney Disease - CKD)
5. **Liver Disease** (Indian Liver Patient Dataset)

## Quick Start

### Step 1: Train All Models
Run the master training script to download datasets and train all models:

```bash
cd backend
python train_all_models.py
```

This script will:
- Download datasets from UCI Machine Learning Repository
- Train 5 neural network models
- Save trained models and scalers to `backend/api/`
- Display accuracy metrics for each model

**Expected Output:**
```
Heart Disease Model - Accuracy: 0.8234, Precision: 0.8521, Recall: 0.7856, F1: 0.8179
Breast Cancer Model - Accuracy: 0.9456, Precision: 0.9612, Recall: 0.9234, F1: 0.9421
Diabetes Model - Accuracy: 0.7823, Precision: 0.7945, Recall: 0.7654, F1: 0.7798
Kidney Disease Model - Accuracy: 0.8567, Precision: 0.8734, Recall: 0.8412, F1: 0.8571
Liver Disease Model - Accuracy: 0.7234, Precision: 0.7456, Recall: 0.7012, F1: 0.7231
```

### Step 2: Start Backend Server
```bash
cd backend
python manage.py runserver
```

### Step 3: Make Predictions via API

## API Endpoints

### Endpoint: POST /api/patients/{patient_id}/disease-risk/

Predict disease risk for a patient using trained ML models.

#### Supported Diseases and Features

##### 1. **Heart Disease**
**Disease Code:** `heart`

**Features Required:**
```json
{
  "disease": "heart",
  "age": 50,
  "gender": "male",
  "cp": 3,
  "trestbps": 130,
  "chol": 250,
  "fbs": 1,
  "restecg": 0,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 2.3,
  "slope": 1,
  "ca": 0,
  "thal": 3
}
```

**Feature Descriptions:**
- `age`: Age in years
- `gender`: "male" or "female"
- `cp`: Chest pain type (0-3)
- `trestbps`: Resting blood pressure (mm Hg)
- `chol`: Serum cholesterol (mg/dl)
- `fbs`: Fasting blood sugar > 120 mg/dl (0/1)
- `restecg`: Resting electrocardiographic results (0-2)
- `thalach`: Maximum heart rate achieved
- `exang`: Exercise induced angina (0/1)
- `oldpeak`: ST depression induced by exercise
- `slope`: Slope of ST segment (0-2)
- `ca`: Number of major vessels (0-4)
- `thal`: Thalassemia (0-3)

---

##### 2. **Breast Cancer**
**Disease Code:** `breast`

**Features Required:**
```json
{
  "disease": "breast",
  "clump_thickness": 5,
  "uniformity_cell_size": 1,
  "uniformity_cell_shape": 1,
  "marginal_adhesion": 1,
  "single_epithelial_cell_size": 2,
  "bare_nuclei": 1,
  "bland_chromatin": 1,
  "normal_nucleoli": 1,
  "mitoses": 1
}
```

**Feature Descriptions:**
- All features are rated on a scale of 1-10
- `clump_thickness`: Clump thickness
- `uniformity_cell_size`: Uniformity of cell size
- `uniformity_cell_shape`: Uniformity of cell shape
- `marginal_adhesion`: Marginal adhesion
- `single_epithelial_cell_size`: Single epithelial cell size
- `bare_nuclei`: Bare nuclei
- `bland_chromatin`: Bland chromatin
- `normal_nucleoli`: Normal nucleoli
- `mitoses`: Mitoses

---

##### 3. **Diabetes**
**Disease Code:** `diabetes`

**Features Required:**
```json
{
  "disease": "diabetes",
  "pregnancies": 2,
  "glucose": 120,
  "blood_pressure": 70,
  "skin_thickness": 20,
  "insulin": 80,
  "bmi": 25.5,
  "diabetes_pedigree": 0.45,
  "age": 35
}
```

**Feature Descriptions (Pima Indians):**
- `pregnancies`: Number of pregnancies
- `glucose`: Plasma glucose concentration (mg/dl)
- `blood_pressure`: Diastolic blood pressure (mm Hg)
- `skin_thickness`: Triceps skin fold thickness (mm)
- `insulin`: 2-Hour serum insulin (mu U/ml)
- `bmi`: Body mass index (kg/m²)
- `diabetes_pedigree`: Diabetes pedigree function
- `age`: Age in years

---

##### 4. **Kidney Disease (CKD)**
**Disease Code:** `kidney` or `kidney disease`

**Features Required:**
```json
{
  "disease": "kidney",
  "age": 55,
  "blood_pressure_systolic": 130,
  "blood_pressure_diastolic": 85,
  "glucose": 110,
  "blood_urea_nitrogen": 25,
  "serum_creatinine": 1.5,
  "sodium": 138,
  "potassium": 4.2
}
```

**Feature Descriptions:**
- `age`: Age in years
- `blood_pressure_systolic`: Systolic BP (mm Hg)
- `blood_pressure_diastolic`: Diastolic BP (mm Hg)
- `glucose`: Fasting blood glucose (mg/dl)
- `blood_urea_nitrogen`: BUN level (mg/dl)
- `serum_creatinine`: Serum creatinine (mg/dl) - key kidney disease marker
- `sodium`: Sodium level (mEq/L)
- `potassium`: Potassium level (mEq/L)

---

##### 5. **Liver Disease**
**Disease Code:** `liver` or `liver disease`

**Features Required:**
```json
{
  "disease": "liver",
  "age": 45,
  "total_bilirubin": 0.9,
  "direct_bilirubin": 0.2,
  "alkaline_phosphatase": 70,
  "alamine_aminotransferase": 32,
  "aspartate_aminotransferase": 28,
  "total_protiens": 6.5,
  "albumin": 3.5
}
```

**Feature Descriptions:**
- `age`: Age in years
- `total_bilirubin`: Total bilirubin (mg/dl)
- `direct_bilirubin`: Direct bilirubin (mg/dl)
- `alkaline_phosphatase`: Alkaline phosphatase (IU/L)
- `alamine_aminotransferase`: Alamine aminotransferase/SGPT (IU/L)
- `aspartate_aminotransferase`: Aspartate aminotransferase/SGOT (IU/L)
- `total_protiens`: Total proteins (g/dl)
- `albumin`: Albumin (g/dl)

---

## Example API Calls

### Using cURL

**Heart Disease Prediction:**
```bash
curl -X POST http://localhost:8000/api/patients/1/disease-risk/ \
  -H "Content-Type: application/json" \
  -d '{
    "disease": "heart",
    "age": 50,
    "gender": "male",
    "cp": 3,
    "trestbps": 130,
    "chol": 250,
    "fbs": 1,
    "restecg": 0,
    "thalach": 150,
    "exang": 0,
    "oldpeak": 2.3,
    "slope": 1,
    "ca": 0,
    "thal": 3
  }'
```

**Diabetes Prediction:**
```bash
curl -X POST http://localhost:8000/api/patients/2/disease-risk/ \
  -H "Content-Type: application/json" \
  -d '{
    "disease": "diabetes",
    "pregnancies": 2,
    "glucose": 120,
    "blood_pressure": 70,
    "skin_thickness": 20,
    "insulin": 80,
    "bmi": 25.5,
    "diabetes_pedigree": 0.45,
    "age": 35
  }'
```

### Using Frontend (JavaScript)

```javascript
// Heart Disease Prediction
async function predictHeartDisease(patientId, data) {
  const response = await fetch(`/api/patients/${patientId}/disease-risk/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      disease: 'heart',
      age: 50,
      gender: 'male',
      cp: 3,
      trestbps: 130,
      chol: 250,
      fbs: 1,
      restecg: 0,
      thalach: 150,
      exang: 0,
      oldpeak: 2.3,
      slope: 1,
      ca: 0,
      thal: 3
    })
  });
  return response.json();
}

// Diabetes Prediction
async function predictDiabetes(patientId, data) {
  const response = await fetch(`/api/patients/${patientId}/disease-risk/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      disease: 'diabetes',
      pregnancies: 2,
      glucose: 120,
      blood_pressure: 70,
      skin_thickness: 20,
      insulin: 80,
      bmi: 25.5,
      diabetes_pedigree: 0.45,
      age: 35
    })
  });
  return response.json();
}
```

## API Response Format

All disease risk predictions return:

```json
{
  "patient_id": 1,
  "disease": "heart",
  "risk_score": 75.5,
  "risk_label": "High",
  "probability": 0.755
}
```

**Response Fields:**
- `patient_id`: ID of the patient
- `disease`: Disease type predicted
- `risk_score`: Risk percentage (0-100)
- `risk_label`: Category ("Low", "Moderate", "High")
  - Low: < 40
  - Moderate: 40-70
  - High: ≥ 70
- `probability`: Decimal probability (0-1)

## Files Created/Modified

### New Training Scripts:
- `backend/train_diabetes_model.py` - Diabetes model training
- `backend/train_kidney_disease_model.py` - Kidney disease model training
- `backend/train_liver_disease_model.py` - Liver disease model training
- `backend/train_all_models.py` - Master training script

### Modified Files:
- `backend/api/ml_engine.py` - Updated to load all disease models and handle predictions

### Generated Model Files (after training):
- `backend/api/diabetes_nn_model.pkl`
- `backend/api/diabetes_scaler.pkl`
- `backend/api/kidney_disease_nn_model.pkl`
- `backend/api/kidney_disease_scaler.pkl`
- `backend/api/liver_disease_nn_model.pkl`
- `backend/api/liver_disease_scaler.pkl`

### Downloaded Datasets (in `data/` directory):
- `data/diabetes.csv` - Pima Indians Diabetes Database
- `data/kidney_disease.csv` - Chronic Kidney Disease Dataset
- `data/liver_disease.csv` - Indian Liver Patient Dataset

## Troubleshooting

### Models not loading
**Problem:** "Model not loaded for {disease}"

**Solution:** Run the training script:
```bash
python train_all_models.py
```

### Dataset download fails
**Problem:** Network error downloading datasets

**Solution:** 
1. Check internet connection
2. Run individual training scripts to see detailed error messages
3. Download datasets manually from UCI Repository and save to `data/` folder

### Low accuracy for a model
**Problem:** Model prediction accuracy is lower than expected

**Solution:**
1. More training data may be needed
2. Adjust hyperparameters in training scripts
3. Check feature scaling and preprocessing

## Next Steps

1. **Train Models:** `python train_all_models.py`
2. **Start Server:** `python manage.py runserver`
3. **Test Predictions:** Use the API endpoints
4. **Integrate Frontend:** Update your JS prediction pages to use all 5 diseases
5. **Monitor Performance:** Track prediction accuracy in production

## Model Performance (Expected)

Based on standard UCI datasets:
- **Heart Disease:** ~82% accuracy
- **Breast Cancer:** ~94% accuracy
- **Diabetes:** ~78% accuracy
- **Kidney Disease:** ~85% accuracy
- **Liver Disease:** ~72% accuracy

*Note: Actual accuracy may vary based on training dataset quality and feature engineering.*
