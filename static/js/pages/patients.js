/* ═══════════════════════════════════════════════════════════
   pages/patients.js — Patients CRUD page
   ═══════════════════════════════════════════════════════════ */

const PatientsPage = {
  state: { q:'', gender:'', page:1, perPage:8 },

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
    this.state = { q:'', gender:'', page:1, perPage:8 };
    this.renderTable();
  },

  renderTable() {
    const s = this.state;
    let pts = DB.load('patients');
    if (s.q)      pts = pts.filter(p => p.name.toLowerCase().includes(s.q) || (p.condition||'').toLowerCase().includes(s.q) || (p.phone||'').includes(s.q));
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
        <thead><tr><th>ID</th><th>Patient</th><th>Age</th><th>Gender</th><th>Blood</th><th>Condition</th><th>Phone</th><th>Actions</th></tr></thead>
        <tbody>${slice.map(p => `<tr>
          <td><span class="tmut">#${p.id}</span></td>
          <td><div class="fac gap8">${Utils.avatarHtml(p.name)}<strong>${p.name}</strong></div></td>
          <td>${p.age}</td>
          <td>${Utils.statusBadge(p.gender)}</td>
          <td><span class="badge b-cyan">${p.blood || '—'}</span></td>
          <td>${p.condition ? `<span class="badge b-orange">${p.condition}</span>` : '<span class="tmut">—</span>'}</td>
          <td class="tmut">${p.phone || '—'}</td>
          <td><div class="actions-cell">
            <button class="btn btn-sm btn-secondary btn-icon" title="Edit"   onclick="PatientsPage.openModal(${p.id})">✏️</button>
            <button class="btn btn-sm btn-danger    btn-icon" title="Delete" onclick="PatientsPage.delete(${p.id})">🗑</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>`;
    }

    document.getElementById('pat-pag').innerHTML = `
      <span class="pag-info">Showing ${slice.length} of ${total} patients</span>
      <div class="pag-btns">
        <button class="pag-btn" ${s.page<=1?'disabled':''} onclick="PatientsPage.state.page--;PatientsPage.renderTable()">‹</button>
        ${Array.from({length:pages},(_,i) => `<button class="pag-btn ${i+1===s.page?'active':''}" onclick="PatientsPage.state.page=${i+1};PatientsPage.renderTable()">${i+1}</button>`).join('')}
        <button class="pag-btn" ${s.page>=pages?'disabled':''} onclick="PatientsPage.state.page++;PatientsPage.renderTable()">›</button>
      </div>`;
  },

  filter(q, gender) {
    if (q !== undefined)      this.state.q      = q.toLowerCase();
    if (gender !== undefined) this.state.gender = gender;
    this.state.page = 1;
    this.renderTable();
  },

  openModal(id) {
    const pt = id ? DB.load('patients').find(p => p.id === id) : null;
    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">${pt ? 'Edit Patient' : 'Add Patient'}</span>
        <button class="modal-x">×</button>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Full Name *</label><input class="input" id="pt-name" placeholder="Full name" value="${pt?.name||''}"/></div>
        <div class="fg"><label class="flbl">Age *</label><input class="input" type="number" id="pt-age" placeholder="Age" value="${pt?.age||''}"/></div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Gender *</label>
          <select class="input" id="pt-gender">
            <option ${pt?.gender==='Male'?'selected':''}>Male</option>
            <option ${pt?.gender==='Female'?'selected':''}>Female</option>
            <option ${pt?.gender==='Other'?'selected':''}>Other</option>
          </select>
        </div>
        <div class="fg"><label class="flbl">Blood Group</label>
          <select class="input" id="pt-blood">
            ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => `<option ${pt?.blood===b?'selected':''}>${b}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Phone</label><input class="input" id="pt-phone" placeholder="Mobile number" value="${pt?.phone||''}"/></div>
        <div class="fg"><label class="flbl">Condition</label><input class="input" id="pt-cond" placeholder="e.g. Diabetes" value="${pt?.condition||''}"/></div>
      </div>
      <div class="fg"><label class="flbl">Address</label><input class="input" id="pt-addr" placeholder="City / Address" value="${pt?.address||''}"/></div>
      <div class="modal-ft">
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-primary"   onclick="PatientsPage.save(${id||'null'})">💾 Save Patient</button>
      </div>`);
  },

  save(id) {
    const name = document.getElementById('pt-name').value.trim();
    const age  = document.getElementById('pt-age').value;
    if (!name || !age) { Utils.toast('Name and Age are required', 'e'); return; }
    const pts  = DB.load('patients');
    const data = {
      name, age: +age,
      gender:    document.getElementById('pt-gender').value,
      blood:     document.getElementById('pt-blood').value,
      phone:     document.getElementById('pt-phone').value,
      condition: document.getElementById('pt-cond').value,
      address:   document.getElementById('pt-addr').value,
    };
    if (id) { const i = pts.findIndex(p => p.id === id); pts[i] = { ...pts[i], ...data }; }
    else pts.push({ id: DB.nextId('patients'), ...data });
    DB.save('patients', pts);
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
      ...pts.map(p => `${p.id},"${p.name}",${p.age},${p.gender},${p.blood||''},${p.condition||''},${p.phone||''},"${p.address||''}"`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(rows);
    a.download = 'patients_export.csv';
    a.click();
    Utils.toast('Patients exported as CSV');
  }
};
