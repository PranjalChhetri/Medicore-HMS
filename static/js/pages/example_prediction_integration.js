/**
 * example_prediction_integration.js
 * 
 * Example of how to integrate the multi-disease prediction system
 * into your MediCore HMS frontend prediction page.
 * 
 * Copy and adapt this code to your existing prediction.js file
 */

// ─────────────────────────────────────────────────────────────────────────────
// Disease Definitions with Required Fields
// ─────────────────────────────────────────────────────────────────────────────

const DISEASE_DEFINITIONS = {
  heart: {
    name: 'Heart Disease',
    icon: '❤️',
    fields: {
      age: { label: 'Age', type: 'number', min: 18, max: 100, hint: 'Age in years' },
      gender: { label: 'Gender', type: 'select', options: ['male', 'female'], hint: 'Biological sex' },
      cp: { label: 'Chest Pain Type', type: 'number', min: 0, max: 3, hint: '0-3 scale' },
      trestbps: { label: 'Resting BP (mm Hg)', type: 'number', min: 80, max: 200, default: 120 },
      chol: { label: 'Cholesterol (mg/dl)', type: 'number', min: 100, max: 400, default: 200 },
      fbs: { label: 'Fasting Blood Sugar > 120', type: 'select', options: [0, 1], hint: '0=No, 1=Yes' },
      restecg: { label: 'Resting ECG', type: 'number', min: 0, max: 2, default: 0 },
      thalach: { label: 'Max Heart Rate', type: 'number', min: 60, max: 220, default: 150 },
      exang: { label: 'Exercise Angina', type: 'select', options: [0, 1], hint: '0=No, 1=Yes' },
      oldpeak: { label: 'ST Depression', type: 'number', min: 0, max: 10, step: 0.1, default: 0 },
      slope: { label: 'ST Segment Slope', type: 'number', min: 0, max: 2, default: 1 },
      ca: { label: 'Major Vessels', type: 'number', min: 0, max: 4, default: 0 },
      thal: { label: 'Thalassemia', type: 'number', min: 0, max: 3, default: 3 }
    }
  },

  breast: {
    name: 'Breast Cancer',
    icon: '🎗️',
    fields: {
      clump_thickness: { label: 'Clump Thickness', type: 'number', min: 1, max: 10, hint: '1-10 scale' },
      uniformity_cell_size: { label: 'Cell Size Uniformity', type: 'number', min: 1, max: 10 },
      uniformity_cell_shape: { label: 'Cell Shape Uniformity', type: 'number', min: 1, max: 10 },
      marginal_adhesion: { label: 'Marginal Adhesion', type: 'number', min: 1, max: 10 },
      single_epithelial_cell_size: { label: 'Epithelial Cell Size', type: 'number', min: 1, max: 10 },
      bare_nuclei: { label: 'Bare Nuclei', type: 'number', min: 1, max: 10 },
      bland_chromatin: { label: 'Bland Chromatin', type: 'number', min: 1, max: 10 },
      normal_nucleoli: { label: 'Normal Nucleoli', type: 'number', min: 1, max: 10 },
      mitoses: { label: 'Mitoses', type: 'number', min: 1, max: 10 }
    }
  },

  diabetes: {
    name: 'Diabetes',
    icon: '🩺',
    fields: {
      pregnancies: { label: 'Number of Pregnancies', type: 'number', min: 0, max: 15, default: 0 },
      glucose: { label: 'Glucose Level (mg/dl)', type: 'number', min: 50, max: 300, default: 100 },
      blood_pressure: { label: 'Blood Pressure (mm Hg)', type: 'number', min: 40, max: 150, default: 70 },
      skin_thickness: { label: 'Skin Thickness (mm)', type: 'number', min: 0, max: 100, default: 20 },
      insulin: { label: 'Insulin Level (mu U/ml)', type: 'number', min: 0, max: 400, default: 80 },
      bmi: { label: 'BMI (kg/m²)', type: 'number', min: 10, max: 60, step: 0.1, default: 25 },
      diabetes_pedigree: { label: 'Diabetes Pedigree', type: 'number', min: 0, max: 2.5, step: 0.01, default: 0.5 },
      age: { label: 'Age (years)', type: 'number', min: 18, max: 100, default: 30 }
    }
  },

  kidney: {
    name: 'Kidney Disease',
    icon: '🫘',
    fields: {
      age: { label: 'Age (years)', type: 'number', min: 18, max: 100 },
      blood_pressure_systolic: { label: 'Systolic BP (mm Hg)', type: 'number', min: 80, max: 200, default: 130 },
      blood_pressure_diastolic: { label: 'Diastolic BP (mm Hg)', type: 'number', min: 40, max: 130, default: 80 },
      glucose: { label: 'Glucose (mg/dl)', type: 'number', min: 50, max: 300, default: 100 },
      blood_urea_nitrogen: { label: 'BUN (mg/dl)', type: 'number', min: 5, max: 100, default: 20 },
      serum_creatinine: { label: 'Creatinine (mg/dl)', type: 'number', min: 0.5, max: 5, step: 0.1, default: 1.2 },
      sodium: { label: 'Sodium (mEq/L)', type: 'number', min: 120, max: 160, default: 140 },
      potassium: { label: 'Potassium (mEq/L)', type: 'number', min: 3, max: 7, step: 0.1, default: 4.5 }
    }
  },

  liver: {
    name: 'Liver Disease',
    icon: '🫀',
    fields: {
      age: { label: 'Age (years)', type: 'number', min: 18, max: 100 },
      total_bilirubin: { label: 'Total Bilirubin (mg/dl)', type: 'number', min: 0.1, max: 5, step: 0.1, default: 0.8 },
      direct_bilirubin: { label: 'Direct Bilirubin (mg/dl)', type: 'number', min: 0, max: 3, step: 0.1, default: 0.2 },
      alkaline_phosphatase: { label: 'Alkaline Phosphatase (IU/L)', type: 'number', min: 20, max: 500, default: 75 },
      alamine_aminotransferase: { label: 'ALT/SGPT (IU/L)', type: 'number', min: 5, max: 500, default: 35 },
      aspartate_aminotransferase: { label: 'AST/SGOT (IU/L)', type: 'number', min: 5, max: 500, default: 35 },
      total_protiens: { label: 'Total Proteins (g/dl)', type: 'number', min: 4, max: 10, step: 0.1, default: 6.5 },
      albumin: { label: 'Albumin (g/dl)', type: 'number', min: 2, max: 5, step: 0.1, default: 3.5 }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Prediction Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Make a disease risk prediction via API
 */
async function predictDisease(patientId, diseaseCode, formData) {
  try {
    const response = await fetch(
      `/api/patients/${patientId}/disease-risk/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: diseaseCode,
          ...formData
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error(`Error predicting ${diseaseCode}:`, error);
    throw error;
  }
}

/**
 * Format prediction result for display
 */
function formatPredictionResult(result) {
  const riskColor = 
    result.risk_label === 'High' ? '#ff4444' :
    result.risk_label === 'Moderate' ? '#ffaa00' :
    '#44aa44';

  return {
    disease: result.disease,
    riskScore: result.risk_score,
    riskLabel: result.risk_label,
    probability: (result.probability * 100).toFixed(1),
    riskColor: riskColor,
    message: `${result.risk_label} Risk (${result.risk_score}%)`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Generation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate disease selector dropdown
 */
function generateDiseaseSelector() {
  const diseases = Object.entries(DISEASE_DEFINITIONS);
  
  let html = '<select id="diseaseSelector" onchange="onDiseaseChange()">';
  html += '<option value="">Select a Disease to Predict...</option>';
  
  diseases.forEach(([code, def]) => {
    html += `<option value="${code}">${def.icon} ${def.name}</option>`;
  });
  
  html += '</select>';
  return html;
}

/**
 * Generate input form for selected disease
 */
function generateDiseaseForm(diseaseCode) {
  if (!diseaseCode || !DISEASE_DEFINITIONS[diseaseCode]) {
    return '';
  }

  const disease = DISEASE_DEFINITIONS[diseaseCode];
  const fields = disease.fields;

  let html = `<div class="disease-form" id="diseaseForm">`;
  html += `<h3>${disease.icon} ${disease.name} Risk Assessment</h3>`;
  html += `<form id="predictionForm">`;

  Object.entries(fields).forEach(([fieldName, fieldDef]) => {
    const id = `field_${fieldName}`;
    const defaultVal = fieldDef.default || '';

    if (fieldDef.type === 'select') {
      html += `<div class="form-group">`;
      html += `<label for="${id}">${fieldDef.label}</label>`;
      html += `<select id="${id}" name="${fieldName}">`;
      html += `<option value="">Select...</option>`;
      
      fieldDef.options.forEach(opt => {
        html += `<option value="${opt}">${opt}</option>`;
      });
      
      html += `</select>`;
      if (fieldDef.hint) html += `<small>${fieldDef.hint}</small>`;
      html += `</div>`;
    } else {
      html += `<div class="form-group">`;
      html += `<label for="${id}">${fieldDef.label}</label>`;
      html += `<input type="${fieldDef.type}" id="${id}" name="${fieldName}" `;
      html += `min="${fieldDef.min}" max="${fieldDef.max}" `;
      if (fieldDef.step) html += `step="${fieldDef.step}" `;
      if (defaultVal) html += `value="${defaultVal}" `;
      html += `required >`;
      if (fieldDef.hint) html += `<small>${fieldDef.hint}</small>`;
      html += `</div>`;
    }
  });

  html += `<button type="submit" class="btn btn-primary">Predict Risk</button>`;
  html += `</form>`;
  html += `</div>`;

  return html;
}

/**
 * Display prediction result
 */
function displayPredictionResult(result) {
  const formatted = formatPredictionResult(result);
  
  let html = `<div class="prediction-result" style="border-left: 5px solid ${formatted.riskColor}">`;
  html += `<h4>Prediction Result</h4>`;
  html += `<p><strong>Disease:</strong> ${result.disease}</p>`;
  html += `<p><strong>Risk Level:</strong> <span style="color: ${formatted.riskColor}; font-weight: bold;">${formatted.riskLabel}</span></p>`;
  html += `<p><strong>Risk Score:</strong> ${formatted.riskScore}%</p>`;
  html += `<p><strong>Probability:</strong> ${formatted.probability}%</p>`;
  html += `</div>`;

  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle disease selection change
 */
async function onDiseaseChange() {
  const diseaseCode = document.getElementById('diseaseSelector').value;
  const formContainer = document.getElementById('formContainer');
  const resultContainer = document.getElementById('resultContainer');

  if (!diseaseCode) {
    formContainer.innerHTML = '';
    resultContainer.innerHTML = '';
    return;
  }

  formContainer.innerHTML = generateDiseaseForm(diseaseCode);
  resultContainer.innerHTML = '';

  // Attach form submit handler
  document.getElementById('predictionForm').addEventListener('submit', onFormSubmit);
}

/**
 * Handle prediction form submission
 */
async function onFormSubmit(e) {
  e.preventDefault();

  const diseaseCode = document.getElementById('diseaseSelector').value;
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Convert string values to numbers
  Object.keys(data).forEach(key => {
    const val = parseFloat(data[key]);
    if (!isNaN(val)) {
      data[key] = val;
    }
  });

  try {
    // Show loading
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '<p>Analyzing patient data...</p>';

    // Get current patient ID (adjust based on your page structure)
    const patientId = document.getElementById('patientId')?.value || 1;

    // Make prediction
    const result = await predictDisease(patientId, diseaseCode, data);

    // Display result
    resultContainer.innerHTML = displayPredictionResult(result);

  } catch (error) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = `<p style="color: red;">❌ Error: ${error.message}</p>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Initialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize prediction page
 */
function initPredictionPage() {
  const controlsContainer = document.getElementById('diseaseControlsContainer');
  const formContainer = document.getElementById('formContainer');
  const resultContainer = document.getElementById('resultContainer');

  if (!controlsContainer || !formContainer || !resultContainer) {
    console.error('Required containers not found in HTML');
    return;
  }

  // Generate disease selector
  controlsContainer.innerHTML = generateDiseaseSelector();

  // Add event listener
  document.getElementById('diseaseSelector').addEventListener('change', onDiseaseChange);
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Integration Template
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paste this HTML into your prediction.html page:
 *
 * <div class="container">
 *   <h2>🏥 Disease Risk Prediction</h2>
 *   
 *   <div id="diseaseControlsContainer">
 *     <!-- Disease selector will be generated here -->
 *   </div>
 *   
 *   <div id="formContainer">
 *     <!-- Disease-specific form will be generated here -->
 *   </div>
 *   
 *   <div id="resultContainer">
 *     <!-- Prediction result will be displayed here -->
 *   </div>
 * </div>
 *
 * Then call initPredictionPage() when your page loads:
 * 
 * document.addEventListener('DOMContentLoaded', initPredictionPage);
 */

// Export for use in HTML or other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    predictDisease,
    formatPredictionResult,
    generateDiseaseSelector,
    generateDiseaseForm,
    displayPredictionResult,
    initPredictionPage,
    DISEASE_DEFINITIONS
  };
}
