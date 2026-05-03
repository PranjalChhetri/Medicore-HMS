/* ═══════════════════════════════════════════════════════════
   pages/appointments.js — Appointments with Smart Scheduling
   ═══════════════════════════════════════════════════════════ */

const AppointmentsPage = {
  _q: '', _status: '',

  render() {
    document.getElementById('page-appointments').innerHTML = `
      <div class="page-hd">
        <div><h2>Appointments</h2><div class="meta">Schedule and manage patient visits</div></div>
        <button class="btn btn-primary" onclick="AppointmentsPage.openModal()">+ Schedule</button>
      </div>
      <div id="apt-alerts"></div>
      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">All Appointments</span>
          <div class="tbl-ctrl">
            <div class="tbl-search">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input id="apt-search" placeholder="Search patient or doctor..." oninput="AppointmentsPage.filter(this.value)"/>
            </div>
            <select class="input" style="width:130px;padding:6px 10px;font-size:12.5px" onchange="AppointmentsPage.filter('', this.value)">
              <option value="">All Status</option>
              <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
            </select>
          </div>
        </div>
        <div id="apt-table-body"></div>
      </div>`;
    this._q = ''; this._status = '';
    this.renderTable();
  },

  renderTable(q, status) {
    if (q !== undefined)      this._q      = q.toLowerCase();
    if (status !== undefined) this._status = status;
    let apts = DB.load('appointments');
    if (this._q)      apts = apts.filter(a => a.patient.toLowerCase().includes(this._q) || a.doctor.toLowerCase().includes(this._q));
    if (this._status) apts = apts.filter(a => a.status === this._status);

    document.getElementById('apt-table-body').innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>AI Slot</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody>${apts.length ? apts.map(a => `<tr>
          <td><span class="tmut">#${a.id}</span></td>
          <td><strong>${a.patient}</strong></td>
          <td><span class="tcyan">${a.doctor}</span></td>
          <td>${Utils.formatDate(a.date)}</td>
          <td class="${a.conflict_flag ? 'text-red' : 'tmut'}">${a.time || '—'} ${a.conflict_flag ? '⚠️' : ''}</td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td class="tmut" style="font-size:11px;color:var(--cyan)">${a.suggested_slot || '—'}</td>
          <td class="tmut" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.notes || '—'}</td>
          <td><div class="actions-cell">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="AppointmentsPage.openModal(${a.id})">✏️</button>
            <button class="btn btn-sm btn-danger    btn-icon" onclick="AppointmentsPage.delete(${a.id})">🗑</button>
          </div></td>
        </tr>`).join('') : `<tr><td colspan="9"><div class="empty"><div class="eicon">📅</div><h3>No appointments found</h3></div></td></tr>`}
        </tbody>
      </table>`;
  },

  filter(q, status) { this.renderTable(q, status); },

  async openModal(id) {
    const a    = id ? DB.load('appointments').find(x => x.id === id) : null;
    const pts  = DB.load('patients').map(p  => `<option ${a?.patient===p.name ?'selected':''}>${p.name}</option>`).join('');
    const docs = DB.load('doctors').map(d   => `<option ${a?.doctor===d.name  ?'selected':''}>${d.name}</option>`).join('');

    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">${a ? 'Edit Appointment' : 'Schedule Appointment'}</span>
        <button class="modal-x">×</button>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Patient *</label>
          <select class="input" id="ap-patient"><option value="">Select patient</option>${pts}</select>
        </div>
        <div class="fg"><label class="flbl">Doctor *</label>
          <select class="input" id="ap-doctor" onchange="AppointmentsPage._fetchSlots()"><option value="">Select doctor</option>${docs}</select>
        </div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Date *</label>
          <input class="input" type="date" id="ap-date" value="${a?.date||''}" onchange="AppointmentsPage._fetchSlots()"/>
        </div>
        <div class="fg"><label class="flbl">Time</label>
          <input class="input" type="time" id="ap-time" value="${a?.time||''}"/>
        </div>
      </div>

      <!-- Smart scheduling panel -->
      <div id="smart-schedule-panel" style="display:none;background:rgba(13,212,178,.06);border:1px solid rgba(13,212,178,.2);border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:8px">🤖 Smart Scheduling</div>
        <div id="smart-schedule-msg" style="font-size:12px;color:var(--text2)"></div>
        <div id="smart-slots" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"></div>
      </div>

      <div class="fr">
        <div class="fg"><label class="flbl">Status</label>
          <select class="input" id="ap-status">
            <option ${a?.status==='Scheduled'?'selected':''}>Scheduled</option>
            <option ${a?.status==='Completed'?'selected':''}>Completed</option>
            <option ${a?.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </div>
        <div class="fg"><label class="flbl">Notes</label>
          <input class="input" id="ap-notes" placeholder="Optional notes" value="${a?.notes||''}"/>
        </div>
      </div>
      <div class="modal-ft">
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-primary"   onclick="AppointmentsPage.save(${id||'null'})">💾 Save</button>
      </div>`);
  },

  async _fetchSlots() {
    const doctor = document.getElementById('ap-doctor')?.value;
    const date   = document.getElementById('ap-date')?.value;
    if (!doctor || !date) return;

    const panel = document.getElementById('smart-schedule-panel');
    const msg   = document.getElementById('smart-schedule-msg');
    const slots = document.getElementById('smart-slots');
    if (!panel) return;

    panel.style.display = 'block';
    msg.textContent = '⏳ Checking availability...';
    slots.innerHTML = '';

    try {
      const result = await getScheduleSuggestion(doctor, date);
      if (!result) { panel.style.display = 'none'; return; }

      msg.innerHTML = result.message;
      if (result.available_slots && result.available_slots.length) {
        slots.innerHTML = result.available_slots.map(s => `
          <button class="badge b-cyan" style="cursor:pointer;border:none;padding:4px 10px" 
            onclick="document.getElementById('ap-time').value='${s}';this.parentNode.querySelectorAll('button').forEach(b=>b.style.background='');this.style.background='var(--cyan)';this.style.color='var(--bg)'">
            ${s}
          </button>`).join('');
      }
      // Auto-fill suggested slot if time is empty
      const timeEl = document.getElementById('ap-time');
      if (!timeEl.value && result.suggested_slot) {
        timeEl.value = result.suggested_slot;
      }
    } catch (e) {
      panel.style.display = 'none';
    }
  },

  save(id) {
    const patient = document.getElementById('ap-patient').value;
    const doctor  = document.getElementById('ap-doctor').value;
    const date    = document.getElementById('ap-date').value;
    if (!patient || !doctor || !date) { Utils.toast('Patient, Doctor and Date are required', 'e'); return; }
    const apts = DB.load('appointments');
    const data = {
      patient, doctor, date,
      time:   document.getElementById('ap-time').value,
      status: document.getElementById('ap-status').value,
      notes:  document.getElementById('ap-notes').value,
    };
    if (id) { const i = apts.findIndex(a => a.id === id); apts[i] = { ...apts[i], ...data }; }
    else apts.push({ id: DB.nextId('appointments'), ...data });
    DB.save('appointments', apts);
    Utils.closeModal();
    Utils.toast(id ? 'Appointment updated' : 'Appointment scheduled');
    this.render();
  },

  delete(id) {
    if (!confirm('Remove this appointment?')) return;
    DB.save('appointments', DB.load('appointments').filter(a => a.id !== id));
    Utils.toast('Appointment removed', 'i');
    this.render();
  }
};
