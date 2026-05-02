/* ═══════════════════════════════════════════════════════════
   pages/prediction.js — AI Disease Prediction
   ═══════════════════════════════════════════════════════════ */

const PredictionPage = {
  selectedDisease: 'heart',

  DISEASES: [
    { id:'heart',       label:'❤️ Heart Disease',  color:'var(--red)' },
    { id:'cancer',      label:'🎗️ Breast Cancer',  color:'var(--pink)' },
    { id:'diabetes',    label:'🩸 Diabetes',        color:'var(--orange)' },
    { id:'hypertension',label:'💉 Hypertension',    color:'var(--blue)' },
    { id:'stroke',      label:'🧠 Stroke Risk',     color:'var(--purple)' },
    { id:'pneumonia',   label:'🫁 Pneumonia',       color:'var(--cyan)' },
  ],

  CONFIGS: {
    heart: {
      title: 'Heart Disease Risk Assessment',
      fields: [
        { id:'age',             label:'Age',                           type:'number', ph:'e.g. 55' },
        { id:'gender',          label:'Gender',                        type:'select', opts:['Male','Female'] },
        { id:'chest_pain',      label:'Chest Pain Type',               type:'select', opts:['Typical Angina','Atypical Angina','Non-Anginal Pain','Asymptomatic'] },
        { id:'bp',              label:'Resting BP (mmHg)',             type:'number', ph:'e.g. 130' },
        { id:'cholesterol',     label:'Cholesterol (mg/dL)',           type:'number', ph:'e.g. 220' },
        { id:'blood_sugar',     label:'Fasting Blood Sugar > 120',     type:'select', opts:['No','Yes'] },
        { id:'max_hr',          label:'Max Heart Rate Achieved',       type:'number', ph:'e.g. 150' },
        { id:'exercise_angina', label:'Exercise-Induced Angina',       type:'select', opts:['No','Yes'] },
        { id:'st_depression',   label:'ST Depression',                 type:'number', ph:'e.g. 1.5' },
        { id:'smoking',         label:'Smoking History',               type:'select', opts:['Never','Former','Current'] },
      ]
    },
    cancer: {
      title: 'Breast Cancer Risk Assessment',
      fields: [
        { id:'clump_thickness', label:'Clump Thickness (1-10)', type:'number', ph:'e.g. 5' },
        { id:'uniformity_cell_size', label:'Uniformity of Cell Size (1-10)', type:'number', ph:'e.g. 3' },
        { id:'uniformity_cell_shape', label:'Uniformity of Cell Shape (1-10)', type:'number', ph:'e.g. 3' },
        { id:'marginal_adhesion', label:'Marginal Adhesion (1-10)', type:'number', ph:'e.g. 2' },
        { id:'single_epithelial_cell_size', label:'Single Epithelial Cell Size (1-10)', type:'number', ph:'e.g. 2' },
        { id:'bare_nuclei', label:'Bare Nuclei (1-10)', type:'number', ph:'e.g. 1' },
        { id:'bland_chromatin', label:'Bland Chromatin (1-10)', type:'number', ph:'e.g. 3' },
        { id:'normal_nucleoli', label:'Normal Nucleoli (1-10)', type:'number', ph:'e.g. 1' },
        { id:'mitoses', label:'Mitoses (1-10)', type:'number', ph:'e.g. 1' },
      ]
    },
    diabetes: {
      title: 'Diabetes Risk Assessment',
      fields: [
        { id:'age',             label:'Age',                           type:'number', ph:'e.g. 45' },
        { id:'gender',          label:'Gender',                        type:'select', opts:['Male','Female'] },
        { id:'glucose',         label:'Fasting Glucose (mg/dL)',       type:'number', ph:'e.g. 110' },
        { id:'bmi',             label:'BMI',                           type:'number', ph:'e.g. 28' },
        { id:'bp',              label:'Blood Pressure (mmHg)',         type:'number', ph:'e.g. 120' },
        { id:'insulin',         label:'2hr Insulin (mu U/ml)',         type:'number', ph:'e.g. 80' },
        { id:'skin_thickness',  label:'Skin Thickness (mm)',           type:'number', ph:'e.g. 20' },
        { id:'family_history',  label:'Family History of Diabetes',    type:'select', opts:['No','Yes - Type 2','Yes - Both Parents'] },
        { id:'physical',        label:'Physical Activity',             type:'select', opts:['Active','Moderately Active','Sedentary'] },
        { id:'diet',            label:'Diet Quality',                  type:'select', opts:['Healthy','Moderate','Poor - High Sugar/Carbs'] },
      ]
    },
    hypertension: {
      title: 'Hypertension Risk Assessment',
      fields: [
        { id:'age',      label:'Age',                      type:'number', ph:'e.g. 50' },
        { id:'gender',   label:'Gender',                   type:'select', opts:['Male','Female'] },
        { id:'bp_sys',   label:'Systolic BP (mmHg)',       type:'number', ph:'e.g. 135' },
        { id:'bp_dia',   label:'Diastolic BP (mmHg)',      type:'number', ph:'e.g. 88' },
        { id:'bmi',      label:'BMI',                      type:'number', ph:'e.g. 30' },
        { id:'sodium',   label:'Salt Intake',              type:'select', opts:['Low','Moderate','High'] },
        { id:'smoking',  label:'Smoking',                  type:'select', opts:['Never','Former','Current'] },
        { id:'alcohol',  label:'Alcohol',                  type:'select', opts:['None','Occasional','Heavy'] },
        { id:'physical', label:'Physical Activity',        type:'select', opts:['Active','Moderate','Sedentary'] },
        { id:'stress',   label:'Stress Level',             type:'select', opts:['Low','Moderate','High','Chronic'] },
      ]
    },
    stroke: {
      title: 'Stroke Risk Assessment',
      fields: [
        { id:'age',         label:'Age',                        type:'number', ph:'e.g. 60' },
        { id:'gender',      label:'Gender',                     type:'select', opts:['Male','Female'] },
        { id:'hypertension',label:'Hypertension History',       type:'select', opts:['No','Yes - Controlled','Yes - Uncontrolled'] },
        { id:'heart_dis',   label:'Heart Disease History',      type:'select', opts:['No','Atrial Fibrillation','Coronary Artery Disease','Other'] },
        { id:'glucose',     label:'Average Glucose (mg/dL)',    type:'number', ph:'e.g. 105' },
        { id:'bmi',         label:'BMI',                        type:'number', ph:'e.g. 27' },
        { id:'smoking',     label:'Smoking Status',             type:'select', opts:['Never','Formerly','Currently'] },
        { id:'carotid',     label:'Carotid Artery Status',      type:'select', opts:['Normal','Mild Stenosis','Significant Stenosis'] },
        { id:'tia',         label:'Previous TIA / Mini-Stroke', type:'select', opts:['No','Yes'] },
        { id:'medication',  label:'Blood Thinner Medication',   type:'select', opts:['None','Aspirin','Anticoagulants'] },
      ]
    },
    pneumonia: {
      title: 'Pneumonia Risk Assessment',
      fields: [
        { id:'age',       label:'Age',                          type:'number', ph:'e.g. 35' },
        { id:'fever',     label:'Fever Temperature (°C)',       type:'number', ph:'e.g. 38.5' },
        { id:'cough',     label:'Cough Type',                   type:'select', opts:['None','Dry','Productive - Clear','Productive - Colored'] },
        { id:'breathing', label:'Breathing Difficulty',         type:'select', opts:['None','Mild','Moderate','Severe'] },
        { id:'chest',     label:'Chest Pain on Breathing',      type:'select', opts:['No','Mild','Severe'] },
        { id:'oxygen',    label:'Oxygen Saturation (%)',        type:'number', ph:'e.g. 97' },
        { id:'wbc',       label:'WBC Count (cells/µL)',         type:'number', ph:'e.g. 12000' },
        { id:'xray',      label:'Chest X-Ray Findings',         type:'select', opts:['Not Done','Normal','Patchy Opacity','Consolidation','Bilateral Infiltrates'] },
        { id:'immune',    label:'Immune Status',                type:'select', opts:['Normal','Mildly Compromised','Immunocompromised'] },
        { id:'duration',  label:'Symptom Duration (days)',      type:'number', ph:'e.g. 5' },
      ]
    },
  },

  render() {
    const el = document.getElementById('page-prediction');
    el.innerHTML = `
      <div class="page-hd">
        <div>
          <h2>AI Disease Prediction</h2>
          <div class="meta"> Clinical decision support tool</div>
        </div>
      </div>
      <div style="background:rgba(59,131,247,.06);border:1px solid rgba(59,131,247,.2);border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:12.5px;color:var(--blue)">
        🤖 <strong>AI Assistant:</strong> Select a disease category, fill in the patient data, and click <em>Run AI Risk Assessment</em>. AI will analyze the inputs and return a detailed clinical risk report.
      </div>
      <div class="disease-tabs" id="disease-tabs">
        ${this.DISEASES.map(d => `
          <button class="dt ${this.selectedDisease === d.id ? 'active' : ''}"
            onclick="PredictionPage.switchDisease('${d.id}')"
            style="${this.selectedDisease === d.id ? `border-color:${d.color};color:${d.color}` : ''}">
            ${d.label}
          </button>`).join('')}
      </div>
      <div class="pred-grid">
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:16px" id="pred-form-title"></div>
          <div id="pred-form-fields"></div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:4px;padding:12px" onclick="PredictionPage.run()">
             Run AI Risk Assessment
          </button>
        </div>
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:14px">Prediction Result</div>
          <div id="pred-result">
            <div style="text-align:center;padding:40px 0;color:var(--text3)">
              <div style="font-size:48px;margin-bottom:12px">🤖</div>
              <div style="font-size:14px">Fill patient data and run assessment</div>
              <div style="font-size:12px;margin-top:4px">AI will analyze risk factors and provide clinical guidance</div>
            </div>
          </div>
        </div>
      </div>`;
    this._renderForm();
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
          html += `<select class="input" id="pf-${f.id}">${f.opts.map(o => `<option>${o}</option>`).join('')}</select>`;
        } else {
          html += `<input class="input" type="${f.type}" id="pf-${f.id}" placeholder="${f.ph || ''}"/>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    document.getElementById('pred-form-fields').innerHTML = html;
  },

  async run() {
    const cfg    = this.CONFIGS[this.selectedDisease];
    const inputs = {};
    cfg.fields.forEach(f => {
      const el = document.getElementById(`pf-${f.id}`);
      if (el) inputs[f.label] = el.value || 'Not provided';
    });

    // Show loading spinner
    document.getElementById('pred-result').innerHTML = `
      <div class="ai-loading">
        <div class="spinner"></div>
        <div style="font-size:14px;font-weight:600">Analyzing with AI Model...</div>
        <div style="font-size:12px;color:var(--text3)">Evaluating risk factors using trained ML model</div>
      </div>`;

    try {
      let result;
      if (this.selectedDisease === 'heart') {
        // Map form fields to model features
        const formData = {};
        cfg.fields.forEach(f => {
          const el = document.getElementById(`pf-${f.id}`);
          if (el) {
            let value = el.value;
            if (f.type === 'select') {
              // Map to numbers
              if (f.id === 'gender') value = value === 'Male' ? 1 : 0;
              else if (f.id === 'chest_pain') {
                const opts = ['Typical Angina','Atypical Angina','Non-Anginal Pain','Asymptomatic'];
                value = opts.indexOf(value);
              } else if (f.id === 'blood_sugar') value = value === 'Yes' ? 1 : 0;
              else if (f.id === 'exercise_angina') value = value === 'Yes' ? 1 : 0;
              else value = 0; // default
            }
            formData[f.id] = parseFloat(value) || 0;
          }
        });

        // Map to model features
        const features = {
          disease: 'heart',
          age: formData.age,
          gender: formData.gender ? 1 : 0,  // Convert to numeric: 1 = male, 0 = female
          cp: formData.chest_pain,
          trestbps: formData.bp,
          chol: formData.cholesterol,
          fbs: formData.blood_sugar,
          restecg: 0, // not in form
          thalach: formData.max_hr,
          exang: formData.exercise_angina,
          oldpeak: formData.st_depression,
          slope: 1, // not in form
          ca: 0, // not in form
          thal: 3, // not in form
        };

        const resp = await fetch(`${API.BASE}/patients/1/disease-risk/`, { // Use dummy patient id
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
        result = {
          risk_level: data.risk_label,
          risk_score: data.risk_score,
          summary: `Heart disease risk assessment: ${data.risk_label} (${data.risk_score}%)`,
          key_factors: ['Age', 'Blood pressure', 'Cholesterol', 'Chest pain type'],
          recommendations: ['Consult cardiologist if high risk', 'Lifestyle modifications'],
          tests_suggested: ['ECG', 'Blood tests', 'Stress test'],
          followup: 'Within 1 week if high risk',
          specialist: 'Cardiologist'
        };
      } else if (this.selectedDisease === 'cancer') {
        // Map form fields to breast cancer model features
        const formData = {};
        cfg.fields.forEach(f => {
          const el = document.getElementById(`pf-${f.id}`);
          if (el) formData[f.id] = parseFloat(el.value) || 1;
        });

        const features = {
          clump_thickness: formData.clump_thickness,
          uniformity_cell_size: formData.uniformity_cell_size,
          uniformity_cell_shape: formData.uniformity_cell_shape,
          marginal_adhesion: formData.marginal_adhesion,
          single_epithelial_cell_size: formData.single_epithelial_cell_size,
          bare_nuclei: formData.bare_nuclei,
          bland_chromatin: formData.bland_chromatin,
          normal_nucleoli: formData.normal_nucleoli,
          mitoses: formData.mitoses,
        };

        const resp = await fetch(`${API.BASE}/patients/1/disease-risk/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disease: 'breast', ...features })
        });
        if (!resp.ok) {
          throw new Error(`Backend error: ${resp.status} ${resp.statusText}`);
        }
        const data = await resp.json();
        if (!data.risk_label) {
          throw new Error('Invalid response format from backend');
        }
        result = {
          risk_level: data.risk_label,
          risk_score: data.risk_score,
          summary: `Breast cancer risk assessment: ${data.risk_label} (${data.risk_score}%)`,
          key_factors: ['Cell uniformity', 'Clump thickness', 'Nucleoli', 'Mitoses'],
          recommendations: ['Mammogram if high risk', 'Biopsy if indicated', 'Genetic counseling'],
          tests_suggested: ['Mammography', 'Biopsy', 'Genetic testing'],
          followup: 'Within 2 weeks if high risk',
          specialist: 'Oncologist'
        };
      } else {
        // For other diseases, use placeholder
        result = {
          risk_level: 'Moderate',
          risk_score: 50,
          summary: 'AI model not trained for this disease yet.',
          key_factors: ['Data collection in progress'],
          recommendations: ['Consult specialist'],
          tests_suggested: ['Standard tests'],
          followup: 'As advised',
          specialist: 'Relevant specialist'
        };
      }
      this._renderResult(result);
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
    const lvl        = (r.risk_level || '').toLowerCase();
    const lvlClass   = lvl === 'low' ? 'rl-low' : lvl === 'moderate' ? 'rl-moderate' : lvl === 'high' ? 'rl-high' : 'rl-critical';
    const C          = 2 * Math.PI * 54;
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
      </button>`;
  }
};
