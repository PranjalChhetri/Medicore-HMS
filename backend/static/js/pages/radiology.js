/* ═══════════════════════════════════════════════════════════
   pages/radiology.js — AI Imaging & Radiology Command Center
   ═══════════════════════════════════════════════════════════ */

const RadiologyPage = {

  SCAN_TYPES: ['MRI', 'CT Scan', 'X-Ray', 'Ultrasound', 'PET Scan'],

  AI_FINDINGS: {
    MRI: [
      'No acute intracranial abnormality detected. White matter appears normal.',
      'Mild signal hyperintensity noted in the periventricular region, likely related to small vessel disease.',
      'Herniated disc at L4-L5 compressing the right nerve root. Moderate severity.',
    ],
    'CT Scan': [
      'No acute pulmonary embolism or pneumonia identified. Lungs clear.',
      'Hyperdense lesion noted in the right lobe of liver measuring 2.3 cm. Further evaluation recommended.',
      'Mild pleural effusion on the left side. No pneumothorax detected.',
    ],
    'X-Ray': [
      'Cardiomegaly present. No active pulmonary infiltrates.',
      'Fracture line visible at the distal radius. Requires orthopedic consultation.',
      'Normal chest X-ray. No acute osseous abnormality.',
    ],
    Ultrasound: [
      'Gallbladder shows multiple echogenic foci with posterior shadowing consistent with cholelithiasis.',
      'Normal abdominal ultrasound. No free fluid or organomegaly.',
      'Increased echogenicity of the liver parenchyma, suggestive of hepatic steatosis.',
    ],
    'PET Scan': [
      'Focal area of increased FDG uptake in the right hilar region. Malignancy cannot be excluded.',
      'No abnormal FDG uptake identified. No evidence of metastatic disease.',
      'Diffuse increased uptake in the mediastinal lymph nodes. Lymphoma vs. sarcoidosis recommended.',
    ],
  },

  render() {
    const el = document.getElementById('page-radiology');
    if (!el) return;

    const scans = DB.load('scans');
    const pending = scans.filter(s => s.status === 'Pending').length;
    const completed = scans.filter(s => s.status === 'Completed').length;
    const critical = scans.filter(s => s.risk === 'High').length;

    el.innerHTML = `
      <div class="page-hd">
        <div>
          <h2>🧬 Radiology AI</h2>
          <div class="meta">Imaging diagnostics & scan management</div>
        </div>
        <div class="page-hd-actions">
          <button class="btn btn-primary" id="btn-new-scan" onclick="RadiologyPage.openAddModal()">
            ➕ New Scan Order
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px;">
        <div class="card" style="text-align:center; padding:16px;">
          <div style="font-size:28px; font-weight:800; color:var(--orange);">${pending}</div>
          <div style="font-size:12px; color:var(--text3); margin-top:4px;">Pending Scans</div>
        </div>
        <div class="card" style="text-align:center; padding:16px;">
          <div style="font-size:28px; font-weight:800; color:var(--green);">${completed}</div>
          <div style="font-size:12px; color:var(--text3); margin-top:4px;">Completed</div>
        </div>
        <div class="card" style="text-align:center; padding:16px;">
          <div style="font-size:28px; font-weight:800; color:var(--red);">${critical}</div>
          <div style="font-size:12px; color:var(--text3); margin-top:4px;">Critical Findings</div>
        </div>
      </div>

      <!-- Scanner Console + Recent Insights -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
        <div class="card">
          <div style="font-size:14px; font-weight:700; margin-bottom:12px;">🖥️ AI Scanning Console</div>
          <div class="scanner-preview" id="scanner-preview">
            <div class="scanner-overlay">
              <div class="scan-line" id="scan-line"></div>
              <div class="crosshair-h"></div>
              <div class="crosshair-v"></div>
            </div>
            <div class="scanner-text" id="scanner-text">NO ACTIVE SCAN</div>
          </div>
          <div id="scan-analysis-result" style="margin-top:14px;"></div>
        </div>

        <div class="card">
          <div style="font-size:14px; font-weight:700; margin-bottom:12px;">🏷️ Scan Type Distribution</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${this.SCAN_TYPES.map(type => {
              const count = scans.filter(s => s.type === type).length;
              const pct = scans.length ? Math.round((count / scans.length) * 100) : 0;
              return `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                    <span style="color:var(--text2);">${type}</span>
                    <span style="color:var(--text3);">${count} scans</span>
                  </div>
                  <div style="height:6px; background:var(--border); border-radius:3px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:var(--cyan); border-radius:3px; transition:width 0.8s ease;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Scan Records Table -->
      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">📋 Diagnostic Scan Archive</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <input class="input" id="scan-search" placeholder="Search patient or type..." 
              style="padding:6px 10px; font-size:12px; width:200px;"
              oninput="RadiologyPage.filterTable(this.value)">
          </div>
        </div>
        <div id="radiology-table-body"></div>
      </div>
    `;

    this.renderTable();
  },

  renderTable(filter = '') {
    const tb = document.getElementById('radiology-table-body');
    if (!tb) return;

    let scans = DB.load('scans').reverse();
    if (filter) {
      const q = filter.toLowerCase();
      scans = scans.filter(s =>
        s.patientName.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.area || '').toLowerCase().includes(q)
      );
    }

    if (!scans.length) {
      tb.innerHTML = `<div class="empty"><div class="eicon">🧬</div><h3>No imaging records found</h3><p>Click "New Scan Order" to create your first radiology record.</p></div>`;
      return;
    }

    tb.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Scan Type</th>
            <th>Body Area</th>
            <th>Date</th>
            <th>Status</th>
            <th>Risk Level</th>
            <th>AI Findings</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${scans.map(s => `
            <tr style="${s.risk === 'High' ? 'background:rgba(240,64,96,0.04);' : ''}">
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  ${Utils.avatarHtml(s.patientName)}
                  <strong>${s.patientName}</strong>
                </div>
              </td>
              <td><span class="badge b-blue">${s.type}</span></td>
              <td>${s.area}</td>
              <td>${s.date}</td>
              <td>${Utils.statusBadge(s.status)}</td>
              <td>
                ${s.risk === 'N/A'
                  ? `<span class="badge b-gray">Pending</span>`
                  : `<span class="badge ${s.risk === 'High' ? 'b-red' : s.risk === 'Moderate' ? 'b-orange' : 'b-green'}">${s.risk}</span>`}
              </td>
              <td style="font-size:11px; color:var(--text3); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" 
                  title="${s.findings || 'N/A'}">${s.findings && s.findings !== 'N/A' ? s.findings : '—'}</td>
              <td>
                <div style="display:flex; gap:6px;">
                  <button class="btn btn-sm btn-primary" onclick="RadiologyPage.runAIAnalysis(${s.id})">
                    🧠 AI Scan
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="RadiologyPage.deleteScan(${s.id})">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  filterTable(q) {
    this.renderTable(q);
  },

  openAddModal() {
    const patients = DB.load('patients');
    Utils.openModal(`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="margin:0;">➕ New Radiology Order</h3>
        <button class="modal-x" onclick="Utils.closeModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3);">✕</button>
      </div>
      <form id="new-scan-form" onsubmit="RadiologyPage.saveScan(event)">
        <div class="form-group" style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:600; color:var(--text3); text-transform:uppercase; margin-bottom:6px;">Select Patient</label>
          <select class="input" id="scan-patient-id" required style="width:100%;">
            <option value="">--- Select Patient ---</option>
            ${patients.map(p => `<option value="${p.id}">${p.name} (Age: ${p.age})</option>`).join('')}
          </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
          <div class="form-group">
            <label style="display:block; font-size:12px; font-weight:600; color:var(--text3); text-transform:uppercase; margin-bottom:6px;">Scan Type</label>
            <select class="input" id="scan-type" required style="width:100%;">
              ${this.SCAN_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label style="display:block; font-size:12px; font-weight:600; color:var(--text3); text-transform:uppercase; margin-bottom:6px;">Body Area</label>
            <input type="text" class="input" id="scan-area" placeholder="e.g. Chest, Brain, Knee" required style="width:100%;">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:600; color:var(--text3); text-transform:uppercase; margin-bottom:6px;">Clinical Notes (Optional)</label>
          <textarea class="input" id="scan-notes" placeholder="Describe symptoms or reason for scan..." style="width:100%; height:70px; resize:vertical;"></textarea>
        </div>
        <div class="form-group" style="margin-bottom:18px;">
          <label style="display:block; font-size:12px; font-weight:600; color:var(--text3); text-transform:uppercase; margin-bottom:6px;">Scheduled Date</label>
          <input type="date" class="input" id="scan-date" style="width:100%;" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Scan Order</button>
        </div>
      </form>
    `);
  },

  saveScan(e) {
    e.preventDefault();
    const pId = document.getElementById('scan-patient-id').value;
    if (!pId) { Utils.toast('Please select a patient', 'e'); return; }

    const pName = document.getElementById('scan-patient-id').selectedOptions[0].text.split(' (')[0];
    const type  = document.getElementById('scan-type').value;
    const area  = document.getElementById('scan-area').value.trim();
    const notes = document.getElementById('scan-notes').value.trim();
    const date  = document.getElementById('scan-date').value;

    const scans = DB.load('scans');
    const newScan = {
      id: DB.nextId('scans'),
      patientId:   parseInt(pId),
      patientName: pName,
      type,
      area,
      notes,
      date,
      status:   'Pending',
      findings: 'N/A',
      risk:     'N/A',
    };

    scans.push(newScan);
    DB.save('scans', scans);
    Utils.closeModal();
    Utils.toast(`✅ Imaging order created for ${pName}`, 's');
    Notif.add(`🧬 New ${type} scan ordered for ${pName} (${area})`, 'info');
    this.render();
  },

  deleteScan(id) {
    if (!confirm('Delete this scan record?')) return;
    const scans = DB.load('scans').filter(s => s.id !== id);
    DB.save('scans', scans);
    Utils.toast('Scan record deleted', 'i');
    this.render();
  },

  runAIAnalysis(id) {
    const scans  = DB.load('scans');
    const idx    = scans.findIndex(s => s.id === id);
    if (idx === -1) return;
    const s = scans[idx];

    const preview    = document.getElementById('scanner-preview');
    const scanText   = document.getElementById('scanner-text');
    const resultBox  = document.getElementById('scan-analysis-result');

    if (!preview) { Utils.toast('Please wait — console loading', 'i'); return; }

    // Activate scanner animation
    preview.classList.add('scanning');
    scanText.textContent = `ANALYZING ${s.type.toUpperCase()}…`;
    resultBox.innerHTML  = '';

    Utils.toast(`🧠 AI analyzing ${s.type} for ${s.patientName}…`, 'i');

    setTimeout(() => {
      preview.classList.remove('scanning');
      scanText.textContent = 'SCAN COMPLETE ✓';

      // Pick AI finding
      const pool    = this.AI_FINDINGS[s.type] || ['Scan analysis complete. No significant abnormalities detected.'];
      const finding = pool[Math.floor(Math.random() * pool.length)];
      const risks   = ['Low', 'Low', 'Moderate', 'High'];
      const risk    = risks[Math.floor(Math.random() * risks.length)];

      // Save to DB
      scans[idx].status   = 'Completed';
      scans[idx].risk     = risk;
      scans[idx].findings = finding;
      DB.save('scans', scans);

      const color = risk === 'High' ? 'var(--red)' : risk === 'Moderate' ? 'var(--orange)' : 'var(--green)';
      const bgCol = risk === 'High' ? 'rgba(240,64,96,0.08)' : risk === 'Moderate' ? 'rgba(245,158,66,0.08)' : 'rgba(13,212,178,0.08)';

      resultBox.innerHTML = `
        <div style="background:${bgCol}; border:1px solid ${color}; border-radius:10px; padding:14px; animation: medico-slide-up 0.4s ease;">
          <div style="font-size:11px; font-weight:700; color:${color}; letter-spacing:1px; margin-bottom:6px;">AI DIAGNOSTIC INSIGHT</div>
          <div style="font-size:13px; font-weight:600; margin-bottom:6px;">${s.patientName} — ${s.type} (${s.area})</div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:11px; color:var(--text3);">Risk Assessment:</span>
            <span class="badge ${risk === 'High' ? 'b-red' : risk === 'Moderate' ? 'b-orange' : 'b-green'}">${risk}</span>
          </div>
          <p style="font-size:12px; color:var(--text2); line-height:1.6; margin:0;">${finding}</p>
        </div>
      `;

      if (risk === 'High') {
        Notif.add(`🚨 Critical finding in ${s.type} for ${s.patientName}! Immediate review required.`, 'error');
        Utils.toast(`CRITICAL: ${s.patientName} requires urgent attention!`, 'e');
      } else {
        Utils.toast(`Analysis complete: ${risk} risk detected`, 's');
      }

      this.renderTable();
    }, 2500);
  },
};
