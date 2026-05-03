/* ═══════════════════════════════════════════════════════════
   pages/triage.js — Smart ER Triage Dashboard
   ═══════════════════════════════════════════════════════════ */

const TriagePage = {
  render() {
    console.log("Rendering Triage Page...");
    const el = document.getElementById('page-triage');
    if (!el) return;

    el.innerHTML = `
      <div class="page-hd" style="margin-bottom: 20px;">
        <div>
          <h2>🚨 Smart ER Triage</h2>
          <div class="meta">Smart Emergency Room Queue</div>
        </div>
        <div class="page-hd-actions">
           <div style="background:rgba(59,131,247,.1); border:1px solid rgba(59,131,247,.3); color:var(--blue); padding:8px 12px; border-radius:6px; font-size:12px; font-weight:600;">
             📊 Statistical Sorting Active
           </div>
        </div>
      </div>
      
      <div class="card mb20">
         <p style="font-size:13.5px; color:var(--text2); margin:0; line-height:1.6;">
            This dashboard uses <strong>Machine Learning Risk Models</strong> to constantly re-evaluate the queue. 
            <span style="color:var(--red); font-weight:700;">Critical patients are automatically pushed to the top of the queue.</span>
         </p>
      </div>

      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">Live Patient Queue</span>
        </div>
        <div id="triage-table-body"></div>
      </div>
    `;
    this.renderTable();
  },

  renderTable() {
    const tb = document.getElementById('triage-table-body');
    if (!tb) return;

    // Filter for only 'Waiting' or unassigned status patients
    let raw = DB.load('patients').filter(p => !p.status || p.status === 'Waiting');
    
    let pts = [...raw].sort((a, b) => (b.readmission_risk || 0) - (a.readmission_risk || 0));

    if (!pts.length) {
      tb.innerHTML = `<div class="empty"><h3>No patients currently waiting in queue</h3><p>All emergency cases have been attended.</p></div>`;
      return;
    }

    tb.innerHTML = `<table>
      <thead>
        <tr>
          <th>Priority</th>
          <th>Patient Name</th>
          <th>Condition</th>
          <th>Risk Score</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${pts.map((p, index) => {
      let risk = p.readmission_risk || 0;
      let priorityClass = risk >= 70 ? 'b-red' : risk >= 40 ? 'b-orange' : 'b-green';
      let priorityLabel = risk >= 70 ? 'CRITICAL' : risk >= 40 ? 'URGENT' : 'STANDARD';
      let rowStyle = risk >= 70 ? 'background: rgba(240, 64, 96, 0.05);' : '';

      return `
          <tr style="${rowStyle}">
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px; font-weight:800; color:var(--text3)">#${index + 1}</span>
                <span class="badge ${priorityClass}">${priorityLabel}</span>
              </div>
            </td>
            <td><div class="fac gap8">${Utils.avatarHtml(p.name)}<strong>${p.name}</strong></div></td>
            <td>${p.condition ? `<span class="badge b-purple">${p.condition}</span>` : '<span class="tmut">—</span>'}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                 <div style="font-weight:700; font-size:16px; color: ${risk >= 70 ? 'var(--red)' : risk >= 40 ? 'var(--orange)' : 'var(--green)'}">${risk.toFixed(1)}%</div>
                 <div style="width: 60px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${risk}%; height: 100%; background: ${risk >= 70 ? 'var(--red)' : risk >= 40 ? 'var(--orange)' : 'var(--green)'};"></div>
                 </div>
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="TriagePage.attend(${p.id})">Attend Patient</button>
            </td>
          </tr>`;
    }).join('')}
      </tbody>
    </table>`;
  },

  attend(id) {
    const pts = DB.load('patients');
    const p = pts.find(x => x.id === id);
    if (!p) return;

    // 1. Update Status to Consultation
    p.status = 'In Consultation';
    DB.save('patients', pts);

    Notif.add(`👨‍⚕️ Patient ${p.name} moved to Consultation (ER1).`, 'info');
    Utils.toast(`🏥 Clinical Handoff: ${p.name} is being moved to ER-Unit 1`);
    
    // 2. Navigate to patients and open their record
    setTimeout(() => {
      Router.navigate('patients');
      
      setTimeout(() => {
         // Filter patient table to show only this patient
         const searchInput = document.getElementById('pat-search');
         if (searchInput) {
           searchInput.value = p.name;
           PatientsPage.filter(p.name);
         }
         
         // Auto-open their record
         PatientsPage.openModal(p.id);
         Utils.toast(`📋 Record loaded for ${p.name}. Ready for consultation.`, 'info');
      }, 400);
    }, 600);
  }
};
