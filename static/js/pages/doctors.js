/* ═══════════════════════════════════════════════════════════
   pages/doctors.js — Doctors CRUD page
   ═══════════════════════════════════════════════════════════ */

const DoctorsPage = {

  render() {
    document.getElementById('page-doctors').innerHTML = `
      <div class="page-hd">
        <div><h2>Doctors</h2><div class="meta">Medical staff directory</div></div>
        <button class="btn btn-primary" onclick="DoctorsPage.openModal()">+ Add Doctor</button>
      </div>
      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">All Doctors</span>
          <div class="tbl-search">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input id="doc-search" placeholder="Search by name, specialization..." oninput="DoctorsPage.filter(this.value)"/>
          </div>
        </div>
        <div id="doc-table-body"></div>
      </div>`;
    this.renderTable();
  },

  renderTable(q = '') {
    let docs = DB.load('doctors');
    if (q) docs = docs.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.spec.toLowerCase().includes(q) ||
      (d.dept || '').toLowerCase().includes(q)
    );
    document.getElementById('doc-table-body').innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>Doctor</th><th>Specialization</th><th>Department</th><th>Experience</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${docs.map(d => `<tr>
          <td><span class="tmut">#${d.id}</span></td>
          <td><div class="fac gap8">${Utils.avatarHtml(d.name)}<strong>${d.name}</strong></div></td>
          <td>${d.spec}</td>
          <td><span class="badge b-blue">${d.dept || '—'}</span></td>
          <td class="tmut">${d.exp || '—'}</td>
          <td class="tmut">${d.phone}</td>
          <td>${Utils.statusBadge(d.status)}</td>
          <td><div class="actions-cell">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="DoctorsPage.openModal(${d.id})">✏️</button>
            <button class="btn btn-sm btn-danger    btn-icon" onclick="DoctorsPage.delete(${d.id})">🗑</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>`;
  },

  filter(q) { this.renderTable(q.toLowerCase()); },

  openModal(id) {
    const d = id ? DB.load('doctors').find(x => x.id === id) : null;
    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">${d ? 'Edit Doctor' : 'Add Doctor'}</span>
        <button class="modal-x">×</button>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Full Name *</label><input class="input" id="dc-name" placeholder="Dr. Full Name" value="${d?.name||''}"/></div>
        <div class="fg"><label class="flbl">Specialization *</label><input class="input" id="dc-spec" placeholder="e.g. Cardiologist" value="${d?.spec||''}"/></div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Department</label><input class="input" id="dc-dept" placeholder="e.g. Cardiology" value="${d?.dept||''}"/></div>
        <div class="fg"><label class="flbl">Experience</label><input class="input" id="dc-exp" placeholder="e.g. 8 yrs" value="${d?.exp||''}"/></div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Phone *</label><input class="input" id="dc-phone" placeholder="9999999999" value="${d?.phone||''}"/></div>
        <div class="fg"><label class="flbl">Status</label>
          <select class="input" id="dc-status">
            <option ${d?.status==='Active'   ?'selected':''}>Active</option>
            <option ${d?.status==='On Leave' ?'selected':''}>On Leave</option>
            <option ${d?.status==='Inactive' ?'selected':''}>Inactive</option>
          </select>
        </div>
      </div>
      <div class="modal-ft">
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-primary"   onclick="DoctorsPage.save(${id||'null'})">💾 Save</button>
      </div>`);
  },

  save(id) {
    const name  = document.getElementById('dc-name').value.trim();
    const spec  = document.getElementById('dc-spec').value.trim();
    const phone = document.getElementById('dc-phone').value.trim();
    if (!name || !spec || !phone) { Utils.toast('Name, Specialization and Phone required', 'e'); return; }
    const docs = DB.load('doctors');
    const data = {
      name, spec, phone,
      dept:   document.getElementById('dc-dept').value,
      exp:    document.getElementById('dc-exp').value,
      status: document.getElementById('dc-status').value,
    };
    let item;
    if (id) { 
      const i = docs.findIndex(d => d.id === id); 
      docs[i] = { ...docs[i], ...data }; 
      item = docs[i];
    } else {
      item = { id: DB.nextId('doctors'), ...data };
      docs.push(item);
    }
    DB.save('doctors', docs, item);
    Utils.closeModal();
    Utils.toast(id ? 'Doctor updated' : 'Doctor added');
    this.render();
  },

  delete(id) {
    if (!confirm('Remove this doctor from the system?')) return;
    DB.save('doctors', DB.load('doctors').filter(d => d.id !== id));
    Utils.toast('Doctor removed', 'i');
    this.render();
  }
};
