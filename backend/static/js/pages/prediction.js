/* ═══════════════════════════════════════════════════════════
   pages/prediction.js — AI Disease Prediction
   ═══════════════════════════════════════════════════════════ */

const PredictionPage = {
  selectedDisease: 'heart',

  DISEASES: [
    { id: 'heart', label: '❤️ Heart Disease', color: 'var(--red)' },
    { id: 'breast', label: '🎗️ Breast Cancer', color: 'var(--pink)' },
    { id: 'diabetes', label: '🩸 Diabetes', color: 'var(--orange)' },
    { id: 'kidney', label: '🫘 Kidney Disease', color: 'var(--blue)' },
    { id: 'liver', label: '🫀 Liver Disease', color: 'var(--purple)' },
  ],

  CONFIGS: {
    heart: {
      title: 'Heart Disease Risk Assessment',
      fields: [
        { id: 'age', label: 'Age (years)', type: 'number', ph: 'e.g. 55' },
        { id: 'gender', label: 'Gender (1=Male, 0=Female)', type: 'select', opts: ['1', '0'] },
        { id: 'cp', label: 'Chest Pain Type (0-3)', type: 'number', ph: 'e.g. 1' },
        { id: 'trestbps', label: 'Resting BP (mm Hg)', type: 'number', ph: 'e.g. 130' },
        { id: 'chol', label: 'Cholesterol (mg/dl)', type: 'number', ph: 'e.g. 220' },
        { id: 'fbs', label: 'Fasting Blood Sugar > 120 (1=Yes)', type: 'select', opts: ['0', '1'] },
        { id: 'restecg', label: 'Resting ECG (0-2)', type: 'number', ph: 'e.g. 0' },
        { id: 'thalach', label: 'Max Heart Rate', type: 'number', ph: 'e.g. 150' },
        { id: 'exang', label: 'Exercise Angina (1=Yes)', type: 'select', opts: ['0', '1'] },
        { id: 'oldpeak', label: 'ST Depression', type: 'number', ph: 'e.g. 1.5' },
        { id: 'slope', label: 'ST Segment Slope (0-2)', type: 'number', ph: 'e.g. 1' },
        { id: 'ca', label: 'Major Vessels (0-4)', type: 'number', ph: 'e.g. 0' },
        { id: 'thal', label: 'Thalassemia (0-3)', type: 'number', ph: 'e.g. 3' },
      ]
    },
    breast: {
      title: 'Breast Cancer Risk Assessment',
      fields: [
        { id: 'clump_thickness', label: 'Clump Thickness (1-10)', type: 'number', ph: 'e.g. 5' },
        { id: 'uniformity_cell_size', label: 'Uniformity of Cell Size (1-10)', type: 'number', ph: 'e.g. 3' },
        { id: 'uniformity_cell_shape', label: 'Uniformity of Cell Shape (1-10)', type: 'number', ph: 'e.g. 3' },
        { id: 'marginal_adhesion', label: 'Marginal Adhesion (1-10)', type: 'number', ph: 'e.g. 2' },
        { id: 'single_epithelial_cell_size', label: 'Epithelial Cell Size (1-10)', type: 'number', ph: 'e.g. 2' },
        { id: 'bare_nuclei', label: 'Bare Nuclei (1-10)', type: 'number', ph: 'e.g. 1' },
        { id: 'bland_chromatin', label: 'Bland Chromatin (1-10)', type: 'number', ph: 'e.g. 3' },
        { id: 'normal_nucleoli', label: 'Normal Nucleoli (1-10)', type: 'number', ph: 'e.g. 1' },
        { id: 'mitoses', label: 'Mitoses (1-10)', type: 'number', ph: 'e.g. 1' },
      ]
    },
    diabetes: {
      title: 'Diabetes Risk Assessment',
      fields: [
        { id: 'pregnancies', label: 'Pregnancies', type: 'number', ph: 'e.g. 2' },
        { id: 'glucose', label: 'Glucose (mg/dl)', type: 'number', ph: 'e.g. 110' },
        { id: 'blood_pressure', label: 'Blood Pressure (mm Hg)', type: 'number', ph: 'e.g. 70' },
        { id: 'skin_thickness', label: 'Skin Thickness (mm)', type: 'number', ph: 'e.g. 20' },
        { id: 'insulin', label: 'Insulin Level (mu U/ml)', type: 'number', ph: 'e.g. 80' },
        { id: 'bmi', label: 'BMI (kg/m²)', type: 'number', ph: 'e.g. 25.0' },
        { id: 'diabetes_pedigree', label: 'Diabetes Pedigree', type: 'number', ph: 'e.g. 0.5' },
        { id: 'age', label: 'Age (years)', type: 'number', ph: 'e.g. 45' },
      ]
    },
    kidney: {
      title: 'Kidney Disease Risk Assessment',
      fields: [
        { id: 'age', label: 'Age (years)', type: 'number', ph: 'e.g. 50' },
        { id: 'blood_pressure_systolic', label: 'Systolic BP (mm Hg)', type: 'number', ph: 'e.g. 130' },
        { id: 'blood_pressure_diastolic', label: 'Diastolic BP (mm Hg)', type: 'number', ph: 'e.g. 80' },
        { id: 'glucose', label: 'Glucose (mg/dl)', type: 'number', ph: 'e.g. 100' },
        { id: 'blood_urea_nitrogen', label: 'BUN (mg/dl)', type: 'number', ph: 'e.g. 20' },
        { id: 'serum_creatinine', label: 'Creatinine (mg/dl)', type: 'number', ph: 'e.g. 1.2' },
        { id: 'sodium', label: 'Sodium (mEq/L)', type: 'number', ph: 'e.g. 140' },
        { id: 'potassium', label: 'Potassium (mEq/L)', type: 'number', ph: 'e.g. 4.5' },
      ]
    },
    liver: {
      title: 'Liver Disease Risk Assessment',
      fields: [
        { id: 'age', label: 'Age (years)', type: 'number', ph: 'e.g. 45' },
        { id: 'total_bilirubin', label: 'Total Bilirubin (mg/dl)', type: 'number', ph: 'e.g. 0.8' },
        { id: 'direct_bilirubin', label: 'Direct Bilirubin (mg/dl)', type: 'number', ph: 'e.g. 0.2' },
        { id: 'alkaline_phosphatase', label: 'Alkaline Phosphatase (IU/L)', type: 'number', ph: 'e.g. 75' },
        { id: 'alamine_aminotransferase', label: 'ALT/SGPT (IU/L)', type: 'number', ph: 'e.g. 35' },
        { id: 'aspartate_aminotransferase', label: 'AST/SGOT (IU/L)', type: 'number', ph: 'e.g. 35' },
        { id: 'total_protiens', label: 'Total Proteins (g/dl)', type: 'number', ph: 'e.g. 6.5' },
        { id: 'albumin', label: 'Albumin (g/dl)', type: 'number', ph: 'e.g. 3.5' },
      ]
    },
  },

  render() {
    const el = document.getElementById('page-prediction');
    el.innerHTML = `
      <div class="page-hd">
        <div>
          <h2>Clinical Risk Prediction</h2>
          <div class="meta"> Clinical decision support tool</div>
        </div>
      </div>
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--blue)">
        <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--text3); margin-bottom:8px">1. Select Patient</div>
        <select class="input" id="pred-patient-id" style="font-weight:600">
          <option value="0">--- Select Clinical Record ---</option>
          ${(DB.load('patients') || []).map(p => `<option value="${p.id}">${p.name} (Age: ${p.age})</option>`).join('')}
        </select>
      </div>

      <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--text3); margin-bottom:10px">2. Select Disease Category</div>
      <div class="disease-tabs" id="disease-tabs">
        ${this.DISEASES.map(d => `
          <button class="dt ${this.selectedDisease === d.id ? 'active' : ''}"
            onclick="PredictionPage.switchDisease('${d.id}')"
            style="${this.selectedDisease === d.id ? `border-color:${d.color};color:${d.color}` : ''}">
            ${d.label}
          </button>`).join('')}
        <button class="dt ${this.selectedDisease === 'history' ? 'active' : ''}" 
                onclick="PredictionPage.switchDisease('history')"
                style="${this.selectedDisease === 'history' ? 'border-color:var(--cyan);color:var(--cyan)' : ''}">
          📜 Prediction History
        </button>
      </div>
      <div id="pred-content-area">
        ${this.selectedDisease === 'history' ? `
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:14px">Recent Assessments Archive</div>
            <div id="history-list">
              <div class="ai-loading"><div class="spinner"></div>Loading archive...</div>
            </div>
          </div>
        ` : `
          <div class="pred-grid">
            <div class="card">
              <div style="font-size:15px;font-weight:700;margin-bottom:16px" id="pred-form-title"></div>
              <div style="background:rgba(255,165,0,.08); border:1px solid rgba(255,165,0,.2); border-radius:8px; padding:12px; margin-bottom:20px;">
                 <div style="font-size:13px; font-weight:700; color:var(--orange); margin-bottom:8px;">✨ Smart Data Scribe</div>
                 <textarea id="nlp-notes" placeholder="Paste unstructured clinical notes here to auto-fill the form..." style="width:100%; height:60px; padding:8px; border:1px solid var(--border); border-radius:6px; font-size:13px; font-family:inherit; margin-bottom:8px; background:var(--bg); color:var(--text); resize:vertical;"></textarea>
                 <button type="button" class="btn btn-secondary" onclick="event.preventDefault(); PredictionPage.parseNotes();" style="font-size:12px; padding:6px 12px;" id="nlp-btn">🧠 Parse Data</button>
                 <div id="nlp-status" style="font-size:11px; margin-top:6px; color:var(--text3); font-style:italic;"></div>
              </div>
              <div id="predictionForm">
                <div id="pred-form-fields"></div>
                 <a href="javascript:void(0)" class="btn btn-primary" onclick="event.preventDefault(); event.stopPropagation(); PredictionPage.run(); return false;" style="width:100%;justify-content:center;margin-top:4px;padding:12px;text-decoration:none;display:flex;align-items:center;">
                   Run Risk Assessment
                 </a>
              </div>
            </div>
            <div class="card">
              <div style="font-size:15px;font-weight:700;margin-bottom:14px">Prediction Result</div>
              <div id="pred-result">
                <div style="text-align:center;padding:40px 0;color:var(--text3)">
                  <div style="font-size:48px;margin-bottom:12px">🩺</div>
                  <div style="font-size:14px">Fill patient data and run assessment</div>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>`;
    if (this.selectedDisease === 'history') {
      this.loadHistory();
    } else {
      this._renderForm();
      
      // Restore last result if it matches current disease
      const saved = JSON.parse(localStorage.getItem('hms_last_prediction') || 'null');
      if (saved && saved.disease === this.selectedDisease) {
        this.lastResult = saved.result;
        this._renderResult(saved.result);
      }
    }
  },

  async loadHistory() {
    try {
      const resp = await fetch(`${API.BASE}/predictions/history/`);
      const data = await resp.json();
      const el = document.getElementById('history-list');
      if (!data.length) {
        el.innerHTML = '<div class="empty">No past assessments found.</div>';
        return;
      }
      el.innerHTML = `
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="text-align:left; border-bottom:1px solid var(--border);">
              <th style="padding:10px;">Date</th>
              <th style="padding:10px;">Patient</th>
              <th style="padding:10px;">Assessment</th>
              <th style="padding:10px;">Risk Level</th>
              <th style="padding:10px;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(h => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:10px; font-size:12px;">${h.date}</td>
                <td style="padding:10px;"><strong>${h.patient_name}</strong></td>
                <td style="padding:10px; text-transform:capitalize;">${h.disease}</td>
                <td style="padding:10px;"><span class="badge ${h.risk_label === 'High' || h.risk_label === 'Critical' ? 'b-red' : h.risk_label === 'Moderate' ? 'b-orange' : 'b-green'}">${h.risk_label}</span></td>
                <td style="padding:10px; font-weight:700; color:${h.risk_score > 70 ? 'var(--red)' : h.risk_score > 40 ? 'var(--orange)' : 'var(--green)'}">${h.risk_score}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      document.getElementById('history-list').innerHTML = `
        <div class="empty">
          <div class="eicon">⚠️</div>
          <h3>Archive Connection Error</h3>
          <p>Failed to load clinical history from backend.</p>
          <div style="font-size:11px; color:var(--text3); margin-top:8px;">Error: ${err.message}</div>
        </div>`;
    }
  },

  switchDisease(id) {
    this.selectedDisease = id;
    this.render();
  },

  _renderForm() {
    const cfg = this.CONFIGS[this.selectedDisease];
    document.getElementById('pred-form-title').textContent = cfg.title;
    let html = '';
    for (let i = 0; i < cfg.fields.length; i += 2) {
      const a = cfg.fields[i], b = cfg.fields[i + 1];
      html += `<div class="fr" style="margin-bottom:12px">`;
      [a, b].filter(Boolean).forEach(f => {
        html += `<div><label class="flbl">${f.label}</label>`;
        if (f.type === 'select') {
          html += `<select class="input" id="pf-${f.id}" required>${f.opts.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        } else {
          html += `<input class="input" type="${f.type}" step="any" id="pf-${f.id}" placeholder="${f.ph || ''}" required/>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    document.getElementById('pred-form-fields').innerHTML = html;
  },

  async parseNotes() {
    const notesEl = document.getElementById('nlp-notes');
    const btnEl = document.getElementById('nlp-btn');
    const statusEl = document.getElementById('nlp-status');
    const notes = notesEl.value.trim();

    if (!notes) {
      statusEl.textContent = 'Please enter some notes first.';
      statusEl.style.color = 'var(--red)';
      return;
    }

    btnEl.innerHTML = '<div class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></div> Parsing...';
    btnEl.disabled = true;
    statusEl.textContent = 'Processing clinical notes...';
    statusEl.style.color = 'var(--text3)';

    try {
      const resp = await fetch(`${API.BASE}/nlp/parse-notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes, disease: this.selectedDisease })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'API Error');
      }

      const res = await resp.json();

      if (res.error) {
        throw new Error(res.error);
      }

      // Auto-fill fields
      const data = res.data || {};
      let filled = 0;
      Object.keys(data).forEach(key => {
        const el = document.getElementById(`pf-${key}`);
        if (el) {
          el.value = data[key];
          // Highlight field briefly to show it was auto-filled
          el.style.transition = 'background 0.3s';
          el.style.background = 'rgba(255,165,0,.15)';
          setTimeout(() => el.style.background = '', 1500);
          filled++;
        }
      });

      statusEl.textContent = `✅ Successfully extracted ${filled} data points!`;
      statusEl.style.color = 'var(--green)';

    } catch (err) {
      statusEl.textContent = `❌ Processing Error: ${err.message}`;
      statusEl.style.color = 'var(--red)';
    } finally {
      btnEl.innerHTML = '🧠 Parse Data';
      btnEl.disabled = false;
    }
  },

  async run() {
    const cfg = this.CONFIGS[this.selectedDisease];
    const features = { disease: this.selectedDisease };

    let emptyFields = [];
    cfg.fields.forEach(f => {
      const el = document.getElementById(`pf-${f.id}`);
      if (el) {
        if (el.value === "") {
          emptyFields.push(f.label);
          el.style.borderColor = 'var(--red)';
        } else {
          el.style.borderColor = '';
          features[f.id] = parseFloat(el.value) || 0;
        }
      }
    });

    if (emptyFields.length > 0) {
      Utils.toast(`Missing Data: Please fill in ${emptyFields[0]} and other fields.`, 'e');
      return;
    }

    const patientId = document.getElementById('pred-patient-id')?.value || 0;
    
    // Show loading spinner
    document.getElementById('pred-result').innerHTML = `
      <div class="ai-loading">
        <div class="spinner"></div>
        <div style="font-size:14px;font-weight:600">Analyzing Clinical Data...</div>
        <div style="font-size:12px;color:var(--text3)">Evaluating risk factors using trained statistical models</div>
      </div>`;

    try {
      // Add an artificial loading delay for presentation effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      const resp = await fetch(`${API.BASE}/patients/${patientId}/disease-risk/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });

      if (!resp.ok) {
        throw new Error(`Backend error: ${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json();

      if (!data.risk_label) {
        throw new Error('Invalid response format from backend');
      }

      // Generate recommendation text based on risk label
      let recommendations = [];
      let tests = [];
      let followup = '';
      let specialist = '';

      if (data.risk_label === 'High' || data.risk_label === 'Critical') {
        recommendations = ['Immediate medical consultation', 'Strict lifestyle modification', 'Prescription medication review'];
        tests = ['Advanced imaging', 'Comprehensive blood panel'];
        followup = 'Within 1-3 days';
        specialist = 'Respective Specialist';
      } else if (data.risk_label === 'Moderate') {
        recommendations = ['Regular monitoring', 'Diet and exercise improvements', 'Preventive care measures'];
        tests = ['Routine screening'];
        followup = 'Within 2-4 weeks';
        specialist = 'General Physician';
      } else {
        recommendations = ['Maintain current healthy lifestyle', 'Annual check-ups'];
        tests = ['None immediately required'];
        followup = 'Annual review';
        specialist = 'Primary Care';
      }

      const result = {
        risk_level: data.risk_label,
        risk_score: data.risk_score,
        summary: `${this.DISEASES.find(d => d.id === this.selectedDisease).label} assessment: ${data.risk_label} Risk (${data.risk_score}%)`,
        key_factors: ['Based on your provided clinical parameters', 'Analyzed against our trained statistical model'],
        recommendations: recommendations,
        tests_suggested: tests,
        followup: followup,
        specialist: specialist
      };

      this.lastResult = result;
      localStorage.setItem('hms_last_prediction', JSON.stringify({ 
        disease: this.selectedDisease, 
        result 
      }));
      this._renderResult(result);
      
      // Update local DB record for the patient
      if (patientId > 0) {
        const patients = DB.load('patients');
        const pIdx = patients.findIndex(p => p.id == patientId);
        if (pIdx !== -1) {
          patients[pIdx].readmission_risk = data.risk_score;
          // Also set the condition if it was empty
          if (!patients[pIdx].condition) {
            patients[pIdx].condition = this.selectedDisease.charAt(0).toUpperCase() + this.selectedDisease.slice(1);
          }
          DB.save('patients', patients);
          console.log(`[Prediction] Updated risk for ${patients[pIdx].name}: ${data.risk_score}%`);
        }
      }

      // Notify if high risk
      if (data.risk_score > 70) {
        const pSelect = document.getElementById('pred-patient-id');
        const pName = pSelect ? pSelect.selectedOptions[0].text.split(' (')[0] : 'Patient';
        Notif.add(`🚨 High Risk Detected: ${this.selectedDisease} assessment for ${pName} shows ${data.risk_score}% risk.`, 'error');
        Utils.toast(`CRITICAL: ${pName} requires immediate clinical attention!`, 'e');
      }
    } catch (err) {
      document.getElementById('pred-result').innerHTML = `
        <div class="empty">
          <div class="eicon">⚠️</div>
          <h3>Connection Error</h3>
          <p>Could not reach the AI service. Check your backend.</p>
          <p style="color:var(--text3);font-size:11px;margin-top:8px">${err.message}</p>
        </div>`;
    }
  },

  _renderResult(r) {
    const scoreColor = r.risk_score < 30 ? 'var(--green)' : r.risk_score < 60 ? 'var(--orange)' : r.risk_score < 80 ? 'var(--red)' : '#ff006e';
    const lvl = (r.risk_level || '').toLowerCase();
    const lvlClass = lvl === 'low' ? 'rl-low' : lvl === 'moderate' ? 'rl-moderate' : lvl === 'high' ? 'rl-high' : 'rl-critical';
    const C = 2 * Math.PI * 54;
    const dashOffset = C - (r.risk_score / 100) * C;

    document.getElementById('pred-result').innerHTML = `
      <div class="gauge-wrap">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" stroke-width="10"/>
          <circle cx="70" cy="70" r="54" fill="none" stroke="${scoreColor}" stroke-width="10"
            stroke-dasharray="${C}" stroke-dashoffset="${dashOffset}"
            stroke-linecap="round" transform="rotate(-90 70 70)"
            style="transition:stroke-dashoffset 1s ease"/>
          <text x="70" y="65" text-anchor="middle" fill="var(--text)" font-size="28" font-weight="900" font-family="Outfit">${r.risk_score}</text>
          <text x="70" y="82" text-anchor="middle" fill="var(--text3)" font-size="11" font-family="Outfit">/ 100</text>
        </svg>
        <span class="risk-lbl ${lvlClass}">${r.risk_level} Risk</span>
        <div style="font-size:12.5px;color:var(--text2);text-align:center;max-width:260px">${r.summary || ''}</div>
      </div>

      <div class="report-box">
        <div class="report-hd">⚠️ Key Risk Factors</div>
        ${(r.key_factors || []).map(f => `<div class="factor-item"><span style="color:var(--red)">•</span>${f}</div>`).join('')}
      </div>

      <div class="report-box" style="margin-top:10px">
        <div class="report-hd">💊 Clinical Recommendations</div>
        ${(r.recommendations || []).map(rc => `<div class="rec-item">→ ${rc}</div>`).join('')}
      </div>

      <div class="report-box" style="margin-top:10px">
        <div class="report-hd">🔬 Suggested Tests &amp; Investigations</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${(r.tests_suggested || []).map(t => `<span class="badge b-purple">${t}</span>`).join('')}
        </div>
      </div>

      <div class="g2" style="margin-top:10px;gap:10px">
        <div class="report-box" style="margin-top:0">
          <div class="report-hd">📅 Follow-up Timeline</div>
          <div style="font-size:13px;font-weight:600;color:var(--cyan)">${r.followup || 'As advised'}</div>
        </div>
        <div class="report-box" style="margin-top:0">
          <div class="report-hd">👨‍⚕️ Refer To</div>
          <div style="font-size:13px;font-weight:600;color:var(--blue)">${r.specialist || 'General Physician'}</div>
        </div>
      </div>

      <div class="disclaimer-box">
        ⚠️ <strong>Medical Disclaimer:</strong> This AI-generated assessment is a clinical support tool only. It does not replace professional medical diagnosis. Always consult a qualified physician before making any medical decisions.
      </div>

      <button class="btn btn-secondary" style="width:100%;justify-content:center;margin-top:12px" onclick="window.print()">
        🖨️ Print Report
      </button>
      
      <div id="care-plan-box" style="margin-top:14px; display:none"></div>
      <button class="btn btn-primary" id="btn-gen-care" onclick="PredictionPage.generateCarePlan()" style="width:100%; justify-content:center; margin-top:8px">
        📜 Generate Personalized Care Plan
      </button>`;
  },

  generateCarePlan() {
    const res = this.lastResult;
    if (!res) return;

    const btn = document.getElementById('btn-gen-care');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin-right:8px"></div> Analyzing Data...';
    btn.disabled = true;

    setTimeout(() => {
      const score = res.risk_score;
      const disease = this.selectedDisease.toUpperCase();
      let plan = '';

      if (score < 30) {
        plan = `<h3>Care Plan: ${disease} (Low Risk)</h3>
                <p>Preventive strategy for healthy maintenance.</p>
                <ul>
                  <li><strong>Nutrition:</strong> Focus on "Plate Method" (50% veggies, 25% protein, 25% grains).</li>
                  <li><strong>Hydration:</strong> 2-3 Liters daily.</li>
                  <li><strong>Activity:</strong> 150 min moderate activity per week.</li>
                  <li><strong>Sleep:</strong> 7-9 hours regular circadian rhythm.</li>
                </ul>`;
      } else if (score < 70) {
        plan = `<h3>Care Plan: ${disease} (Moderate Risk)</h3>
                <p>Targeted risk reduction and monitoring protocol.</p>
                <ul>
                  <li><strong>Diet:</strong> DASH or Mediterranean diet (Salt < 2g/day).</li>
                  <li><strong>Medication:</strong> Discuss preventive therapy with your doctor.</li>
                  <li><strong>Activity:</strong> Structured 30-min daily walks.</li>
                  <li><strong>Vitals:</strong> Home monitoring of BP/Glucose every 48 hours.</li>
                </ul>`;
      } else {
        plan = `<h3>Care Plan: ${disease} (High Risk)</h3>
                <p>Immediate stabilization and clinical intervention path.</p>
                <div class="alert-banner" style="margin:10px 0; background:rgba(240,64,96,0.15); color:#ff5f7e; border-color:rgba(240,64,96,0.3)">🚨 Clinical Attention Required within 24-48 hours.</div>
                <ul>
                  <li><strong>Diet:</strong> Strict therapeutic restriction based on specialist consult.</li>
                  <li><strong>Medication:</strong> Immediate review of pharmaceutical options.</li>
                  <li><strong>Activity:</strong> Physical rest; avoid strenuous exertion.</li>
                  <li><strong>Emergency:</strong> Contact hospital if shortness of breath or acute pain occurs.</li>
                </ul>`;
      }

      const box = document.getElementById('care-plan-box');
      box.innerHTML = `<div class="report-box" style="border-color:var(--cyan); background:rgba(13,212,178,0.05); animation: medico-slide-up 0.4s ease">${plan}</div>`;
      box.style.display = 'block';
      btn.style.display = 'none';
      
      Utils.toast('Personalized Care Plan generated', 's');
      Notif.add(`📜 Care Plan generated for ${this.selectedDisease}`, 'info');
    }, 1500);
  }
};
