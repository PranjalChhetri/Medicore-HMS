/* ═══════════════════════════════════════════════════════════
   pages/radiology.js — AI Imaging & Radiology
   ═══════════════════════════════════════════════════════════ */

const RadiologyPage = {
  render() {
    const el = document.getElementById('page-radiology');
    if (!el) return;

    el.innerHTML = `
      <div class="page-hd">
        <div>
          <h2>🧬 Radiology AI</h2>
          <div class="meta">Imaging diagnostics & scan management</div>
        </div>
        <div class="page-hd-actions">
          <button class="btn btn-primary" onclick="RadiologyPage.openAddModal()">
            <span>➕</span> New Scan Order
          </button>
        </div>
      </div>

      <div class="g2 mb20">
        <div class="card">
          <div style="font-size:14px; font-weight:700; color:var(--text); margin-bottom:12px;">🏥 AI Scanning Console</div>
          <div class="scanner-preview" id="scanner-preview">
            <div class="scanner-overlay">
              <div class="scan-line"></div>
              <div class="crosshair-h"></div>
              <div class="crosshair-v"></div>
            </div>
            <div class="scanner-text">NO ACTIVE SCAN</div>
          </div>
          <div id="scan-analysis-result" style="margin-top:15px; display:none;"></div>
        </div>

        <div class="card">
          <div style="font-size:14px; font-weight:700; color:var(--text); margin-bottom:12px;">📊 Imaging Statistics</div>
          <div class="g2" style="gap:10px;">
             <div class="stat-mini">
                <div class="val" style="color:var(--cyan)">12</div>
                <div class="lbl">Pending CTs</div>
             </div>
             <div class="stat-mini">
                <div class="val" style="color:var(--purple)">8</div>
                <div class="lbl">MRI Queue</div>
             </div>
          </div>
          <div style="margin-top:20px;">
            <div style="font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; margin-bottom:8px;">Recent AI Insights</div>
            <div class="report-box" style="font-size:12px; background:rgba(13,212,178,0.05); border-color:rgba(13,212,178,0.2)">
               <strong>Amit Sharma (MRI Brain)</strong>: No acute intracranial abnormality detected. Normal ventricular system.
            </div>
          </div>
        </div>
      </div>

      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">Diagnostic Scan History</span>
        </div>
        <div id="radiology-table-body"></div>
      </div>
    `;

    this.renderTable();
  },

  renderTable() {
    const tb = document.getElementById('radiology-table-body');
    const scans = DB.load('scans');

    if (!scans.length) {
      tb.innerHTML = '<div class="empty">No imaging records found.</div>';
      return;
    }

    tb.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Scan Type</th>
            <th>Area</th>
            <th>Date</th>
            <th>Risk Level</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${scans.reverse().map(s => `
            <tr>
              <td><strong>${s.patientName}</strong></td>
              <td><span class="badge b-blue">${s.type}</span></td>
              <td>${s.area}</td>
              <td>${s.date}</td>
              <td><span class="badge ${s.risk === 'High' ? 'b-red' : s.risk === 'Moderate' ? 'b-orange' : 'b-green'}">${s.risk}</span></td>
              <td><span class="badge ${s.status === 'Completed' ? 'b-green' : 'b-purple'}">${s.status}</span></td>
              <td>
                <button class="btn btn-sm btn-secondary" onclick="RadiologyPage.runAIAnalysis(${s.id})">
                  🧠 AI Scan
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  openAddModal() {
    const patients = DB.load('patients');
    Utils.modal(`
      <h3>➕ New Radiology Order</h3>
      <form id="new-scan-form" onsubmit="RadiologyPage.saveScan(event)">
        <div class="form-group">
          <label>Select Patient</label>
          <select class="input" id="scan-patient-id" required>
            ${patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Scan Type</label>
            <select class="input" id="scan-type" required>
              <option value="MRI">MRI</option>
              <option value="CT">CT Scan</option>
              <option value="X-RAY">X-Ray</option>
              <option value="ULTRASOUND">Ultrasound</option>
              <option value="PET">PET Scan</option>
            </select>
          </div>
          <div class="form-group">
            <label>Area of Interest</label>
            <input type="text" class="input" id="scan-area" placeholder="e.g. Chest, Brain, Knee" required>
          </div>
        </div>
        <div class="modal-ft">
          <button type="button" class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Order</button>
        </div>
      </form>
    `);
  },

  saveScan(e) {
    e.preventDefault();
    const pId = document.getElementById('scan-patient-id').value;
    const pName = document.getElementById('scan-patient-id').selectedOptions[0].text;
    const type = document.getElementById('scan-type').value;
    const area = document.getElementById('scan-area').value;

    const scans = DB.load('scans');
    const newScan = {
      id: DB.nextId('scans'),
      patientId: parseInt(pId),
      patientName: pName,
      type: type,
      area: area,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      findings: 'N/A',
      risk: 'N/A'
    };

    scans.push(newScan);
    DB.save('scans', scans);
    Utils.closeModal();
    Utils.toast(`Imaging order created for ${pName}`, 's');
    this.render();
  },

  runAIAnalysis(id) {
    const scans = DB.load('scans');
    const s = scans.find(x => x.id === id);
    if (!s) return;

    const preview = document.getElementById('scanner-preview');
    const resultBox = document.getElementById('scan-analysis-result');
    
    preview.classList.add('scanning');
    preview.querySelector('.scanner-text').textContent = `ANALYZING ${s.type}...`;
    resultBox.style.display = 'none';

    setTimeout(() => {
      preview.classList.remove('scanning');
      preview.querySelector('.scanner-text').textContent = 'SCAN COMPLETE';

      // Mock AI Results
      const risks = ['Low', 'Moderate', 'High'];
      const risk = risks[Math.floor(Math.random() * risks.length)];
      const findings = risk === 'High' ? `Detected potential tissue density abnormality in the ${s.area} region. Recommend immediate biopsy.` : `Scan of ${s.area} appears within clinical normal limits. No acute findings.`;

      s.status = 'Completed';
      s.risk = risk;
      s.findings = findings;
      DB.save('scans', scans);

      resultBox.innerHTML = `
        <div class="report-box" style="animation: medico-slide-up 0.4s ease; border-color:${risk === 'High' ? 'var(--red)' : 'var(--green)'}">
          <div style="font-size:12px; font-weight:700; color:${risk === 'High' ? 'var(--red)' : 'var(--green)'}; margin-bottom:5px;">AI DIAGNOSTIC INSIGHT</div>
          <div style="font-size:13px; font-weight:600; margin-bottom:8px;">${s.patientName} (${s.type} ${s.area})</div>
          <p style="font-size:12px; color:var(--text2); line-height:1.4; margin:0;">${findings}</p>
        </div>
      `;
      resultBox.style.display = 'block';
      this.renderTable();
      Utils.toast('AI Analysis Complete', 's');
    }, 2500);
  }
};
