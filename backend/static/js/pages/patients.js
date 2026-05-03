/* ═══════════════════════════════════════════════════════════
   pages/patients.js — Patients CRUD page
   ═══════════════════════════════════════════════════════════ */

const PatientsPage = {
  state: { q: '', gender: '', page: 1, perPage: 8 },

  render() {
    document.getElementById('page-patients').innerHTML = `
      <div class="page-hd">
        <div><h2>Patients</h2><div class="meta">${DB.load('patients').length} total records</div></div>
        <div class="page-hd-actions">
          <button class="btn btn-secondary btn-sm" onclick="PatientsPage.exportCSV()">⬇ Export CSV</button>
          <button class="btn btn-primary" onclick="PatientsPage.openModal()">+ Add Patient</button>
        </div>
      </div>
      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">All Patients</span>
          <div class="tbl-ctrl">
            <div class="tbl-search">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input id="pat-search" placeholder="Search by name, condition, phone..." oninput="PatientsPage.filter(this.value)"/>
            </div>
            <select class="input" style="width:140px;padding:6px 10px;font-size:12.5px" onchange="PatientsPage.filter(document.getElementById('pat-search').value, this.value)">
              <option value="">All Genders</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div id="pat-table-body"></div>
        <div class="pag" id="pat-pag"></div>
      </div>`;
    this.state = { q: '', gender: '', page: 1, perPage: 8 };
    this.renderTable();
  },

  renderTable() {
    const s = this.state;
    let pts = DB.load('patients');
    if (s.q) pts = pts.filter(p => p.name.toLowerCase().includes(s.q) || (p.condition || '').toLowerCase().includes(s.q) || (p.phone || '').includes(s.q));
    if (s.gender) pts = pts.filter(p => p.gender === s.gender);

    const total = pts.length;
    const pages = Math.max(1, Math.ceil(total / s.perPage));
    s.page = Math.min(s.page, pages);
    const slice = pts.slice((s.page - 1) * s.perPage, s.page * s.perPage);

    const tb = document.getElementById('pat-table-body');
    if (!slice.length) {
      tb.innerHTML = `<div class="empty"><div class="eicon">👥</div><h3>No patients found</h3><p>Try a different search or add a new patient.</p></div>`;
    } else {
      tb.innerHTML = `<table>
        <thead><tr><th>ID</th><th>Patient</th><th>Age</th><th>Gender</th><th>Status</th><th>Blood</th><th>Condition</th><th>Phone</th><th>Actions</th></tr></thead>
        <tbody>${slice.map(p => `<tr>
          <td><span class="tmut">#${p.id}</span></td>
          <td><div class="fac gap8">${Utils.avatarHtml(p.name)}<strong>${p.name}</strong></div></td>
          <td>${p.age}</td>
          <td>${Utils.statusBadge(p.gender)}</td>
          <td>${Utils.statusBadge(p.status || 'Waiting')}</td>
          <td><span class="badge b-cyan">${p.blood || '—'}</span></td>
          <td>${p.condition ? `<span class="badge b-orange">${p.condition}</span>` : '<span class="tmut">—</span>'}</td>
          <td class="tmut">${p.phone || '—'}</td>
          <td><div class="actions-cell">
            <button class="btn btn-sm btn-primary btn-icon" title="📄 AI Care Plan" onclick="PatientsPage.generateCarePlan(${p.id})">📄</button>
            <button class="btn btn-sm btn-primary btn-icon" title="AI Drug Safety Check" onclick="PatientsPage.openDrugCheckModal(${p.id})">💊</button>
            <button class="btn btn-sm btn-secondary btn-icon" title="Edit"   onclick="PatientsPage.openModal(${p.id})">✏️</button>
            <button class="btn btn-sm btn-danger    btn-icon" title="Delete" onclick="PatientsPage.delete(${p.id})">🗑</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>`;
    }

    document.getElementById('pat-pag').innerHTML = `
      <span class="pag-info">Showing ${slice.length} of ${total} patients</span>
      <div class="pag-btns">
        <button class="pag-btn" ${s.page <= 1 ? 'disabled' : ''} onclick="PatientsPage.state.page--;PatientsPage.renderTable()">‹</button>
        ${Array.from({ length: pages }, (_, i) => `<button class="pag-btn ${i + 1 === s.page ? 'active' : ''}" onclick="PatientsPage.state.page=${i + 1};PatientsPage.renderTable()">${i + 1}</button>`).join('')}
        <button class="pag-btn" ${s.page >= pages ? 'disabled' : ''} onclick="PatientsPage.state.page++;PatientsPage.renderTable()">›</button>
      </div>`;
  },

  filter(q, gender) {
    if (q !== undefined) this.state.q = q.toLowerCase();
    if (gender !== undefined) this.state.gender = gender;
    this.state.page = 1;
    this.renderTable();
  },

  openDrugCheckModal(id) {
    const pt = DB.load('patients').find(p => p.id === id);
    if (!pt) return;

    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">💊 Drug Safety Validation</span>
        <button class="modal-x">×</button>
      </div>
      <div style="background:rgba(59,131,247,.08); border:1px solid rgba(59,131,247,.2); border-radius:6px; padding:10px; margin-bottom:15px; font-size:12.5px;">
        <strong>Patient:</strong> ${pt.name} <br/>
        <strong>Conditions:</strong> ${pt.condition || 'None reported'}
      </div>
      <div class="fg">
        <label class="flbl">Medication to Prescribe</label>
        <input class="input" id="drug-name" placeholder="e.g. Ibuprofen, Metformin, Lisinopril"/>
      </div>
      <div id="drug-check-result" style="margin-top:10px; font-size:13px;"></div>
      <div class="modal-ft" style="margin-top:20px;">
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="PatientsPage.checkDrugSafety(${pt.id})">🔍 Check Safety</button>
      </div>
    `);
  },

  async checkDrugSafety(id) {
    const pt = DB.load('patients').find(p => p.id === id);
    const drugInput = document.getElementById('drug-name').value.trim();
    const resultDiv = document.getElementById('drug-check-result');

    if (!drugInput) {
      resultDiv.innerHTML = '<span style="color:var(--red)">Please enter a medication name.</span>';
      return;
    }

    resultDiv.innerHTML = '<div class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></div> <span style="color:var(--text3)">Checking safety parameters...</span>';

    try {
      const resp = await fetch(`${API.BASE}/nlp/check-drug-conflict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions: pt.condition || 'Healthy', drug: drugInput })
      });

      if (!resp.ok) throw new Error('Failed to reach validation service');

      const res = await resp.json();

      let badgeColor = 'var(--gray)';
      if (res.risk_level === 'SAFE') badgeColor = 'var(--green)';
      else if (res.risk_level === 'WARNING') badgeColor = 'var(--orange)';
      else if (res.risk_level === 'SEVERE') badgeColor = 'var(--red)';

      resultDiv.innerHTML = `
           <div style="border-left: 3px solid ${badgeColor}; padding-left: 10px; margin-top: 10px;">
             <div style="font-weight:700; color:${badgeColor}; margin-bottom:4px;">[${res.risk_level}]</div>
             <div style="margin-bottom:6px; color:var(--text2);">${res.explanation}</div>
             <div style="font-weight:600; font-size:12px;">Recommendation: ${res.recommendation}</div>
           </div>
        `;
    } catch (err) {
      resultDiv.innerHTML = `<span style="color:var(--red)">❌ Error: ${err.message}</span>`;
    }
  },

  async generateCarePlan(id) {
    const pt = DB.load('patients').find(p => p.id === id);
    if (!pt) return;

    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">📄 AI Post-Discharge Care Plan</span>
        <button class="modal-x">×</button>
      </div>
      <div style="padding:40px; text-align:center;" id="care-plan-loading">
        <div class="spinner" style="width:30px; height:30px; margin:0 auto 15px;"></div>
        <div style="color:var(--text2); font-size:14px;"><strong>Medico AI</strong> is analyzing patient history and clinical guidelines...</div>
      </div>
      <div id="care-plan-result" style="display:none; max-height:500px; overflow-y:auto; padding:5px;"></div>
      <div class="modal-ft" id="care-plan-ft" style="display:none; margin-top:20px;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Print Report</button>
        <button class="btn btn-primary" onclick="Utils.closeModal()">Finish Review</button>
      </div>
    `);

    try {
      const resp = await fetch(`${API.BASE}/nlp/generate-care-plan/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition: pt.condition || 'General Observation', age: pt.age, gender: pt.gender })
      });

      if (!resp.ok) throw new Error('AI Service Unavailable');

      const res = await resp.json();
      
      document.getElementById('care-plan-loading').style.display = 'none';
      const resultDiv = document.getElementById('care-plan-result');
      resultDiv.style.display = 'block';
      document.getElementById('care-plan-ft').style.display = 'flex';

      resultDiv.innerHTML = `
        <div style="border-bottom: 2px solid var(--border); padding-bottom: 15px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <div style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; font-weight:700;">MediCore Clinical Core</div>
            <div style="font-size:22px; font-weight:800; color:var(--cyan);">DISCHARGE SUMMARY</div>
          </div>
          <div style="text-align:right; font-size:12px; color:var(--text3);">
            Generated: ${new Date().toLocaleDateString()} <br/>
            Ref: MC-${pt.id}-${Math.floor(Math.random()*900)+100}
          </div>
        </div>
        
        <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:15px; margin-bottom:20px; border:1px solid var(--border); display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
           <div><span class="tmut">Patient:</span> <strong>${pt.name}</strong></div>
           <div><span class="tmut">Gender/Age:</span> <strong>${pt.gender}, ${pt.age}y</strong></div>
           <div style="grid-column: span 2;"><span class="tmut">Primary Condition:</span> <strong style="color:var(--orange)">${pt.condition || 'General Recovery'}</strong></div>
        </div>

        <div class="care-plan-content" style="font-size:14px; line-height:1.6; color:var(--text2);">
          ${res.html}
        </div>
        
        <div style="margin-top:30px; border-top:1px dashed var(--border); padding-top:20px; font-size:11px; color:var(--text3); text-align:center;">
           This document was generated by the <strong>MediCore Intelligent Concierge (Medico)</strong>. <br/>
           Information is based on current clinical documentation and should be verified by the attending physician.
        </div>
      `;

    } catch (err) {
      document.getElementById('care-plan-loading').innerHTML = `<div style="color:var(--red); font-weight:600;">❌ Error: ${err.message}</div>`;
    }
  },

  openModal(id) {
    const pt = id ? DB.load('patients').find(p => p.id === id) : null;
    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">${pt ? 'Edit Patient' : 'Add Patient'}</span>
        <button class="modal-x">×</button>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Full Name *</label><input class="input" id="pt-name" placeholder="Full name" value="${pt?.name || ''}"/></div>
        <div class="fg"><label class="flbl">Age *</label><input class="input" type="number" id="pt-age" placeholder="Age" value="${pt?.age || ''}"/></div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Gender *</label>
          <select class="input" id="pt-gender">
            <option ${pt?.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option ${pt?.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option ${pt?.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div class="fg"><label class="flbl">Blood Group</label>
          <select class="input" id="pt-blood">
            ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => `<option ${pt?.blood === b ? 'selected' : ''}>${b}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Phone</label><input class="input" id="pt-phone" placeholder="Mobile number" value="${pt?.phone || ''}"/></div>
        <div class="fg"><label class="flbl">Condition</label><input class="input" id="pt-cond" placeholder="e.g. Diabetes" value="${pt?.condition || ''}"/></div>
      </div>
      <div class="fg"><label class="flbl">Address</label><input class="input" id="pt-addr" placeholder="City / Address" value="${pt?.address || ''}"/></div>
      <div class="modal-ft">
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-primary"   onclick="PatientsPage.save(${id || 'null'})">💾 Save Patient</button>
      </div>`);
  },

  save(id) {
    const name = document.getElementById('pt-name').value.trim();
    const age = document.getElementById('pt-age').value;
    if (!name || !age) { Utils.toast('Name and Age are required', 'e'); return; }
    const pts = DB.load('patients');
    const data = {
      name, age: +age,
      gender: document.getElementById('pt-gender').value,
      blood: document.getElementById('pt-blood').value,
      phone: document.getElementById('pt-phone').value,
      condition: document.getElementById('pt-cond').value,
      address: document.getElementById('pt-addr').value,
    };
    let item;
    if (id) { 
      const i = pts.findIndex(p => p.id === id); 
      pts[i] = { ...pts[i], ...data }; 
      item = pts[i];
    } else {
      item = { id: DB.nextId('patients'), ...data };
      pts.push(item); 
    }
    DB.save('patients', pts, item);
    Utils.closeModal();
    Utils.toast(id ? 'Patient updated' : 'Patient added');
    this.render();
    Router.updateBadges();
  },

  delete(id) {
    if (!confirm('Delete this patient record?')) return;
    DB.save('patients', DB.load('patients').filter(p => p.id !== id));
    Utils.toast('Patient deleted', 'i');
    this.render();
    Router.updateBadges();
  },

  exportCSV() {
    const pts = DB.load('patients');
    const rows = ['ID,Name,Age,Gender,Blood,Condition,Phone,Address',
      ...pts.map(p => `${p.id},"${p.name}",${p.age},${p.gender},${p.blood || ''},${p.condition || ''},${p.phone || ''},"${p.address || ''}"`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(rows);
    a.download = 'patients_export.csv';
    a.click();
    Utils.toast('Patients exported as CSV');
  }
};
