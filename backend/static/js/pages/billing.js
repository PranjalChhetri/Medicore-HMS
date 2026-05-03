/* ═══════════════════════════════════════════════════════════
   pages/billing.js — Billing CRUD page
   ═══════════════════════════════════════════════════════════ */

const BillingPage = {

  render() {
    const bills   = DB.load('billing');
    const paid    = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
    const pending = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + (b.amount - (b.paid || 0)), 0);

    document.getElementById('page-billing').innerHTML = `
      <div class="page-hd">
        <div><h2>Billing</h2><div class="meta">Financial records &amp; revenue tracking</div></div>
        <button class="btn btn-primary" onclick="BillingPage.openModal()">+ Add Bill</button>
      </div>
      <div class="bill-sum">
        <div class="bill-st">
          <div class="bill-st-lbl">Total Revenue</div>
          <div class="bill-st-val" style="color:var(--green)">₹${(paid / 1000).toFixed(1)}K</div>
        </div>
        <div class="bill-st">
          <div class="bill-st-lbl">Outstanding</div>
          <div class="bill-st-val" style="color:var(--orange)">₹${(pending / 1000).toFixed(1)}K</div>
        </div>
        <div class="bill-st">
          <div class="bill-st-lbl">Total Bills</div>
          <div class="bill-st-val">${bills.length}</div>
        </div>
      </div>
      <div class="tbl-wrap">
        <div class="tbl-hd">
          <span class="tbl-title">All Bills</span>
          <div class="tbl-search">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search patient or description..." oninput="BillingPage.filter(this.value)"/>
          </div>
        </div>
        <div id="bill-table-body"></div>
      </div>`;
    this.renderTable();
  },

  renderTable(q = '') {
    let bills = DB.load('billing');
    if (q) bills = bills.filter(b => b.patient.toLowerCase().includes(q) || (b.desc||'').toLowerCase().includes(q));
    document.getElementById('bill-table-body').innerHTML = `
      <table>
        <thead><tr><th>Bill ID</th><th>Patient</th><th>Date</th><th>Description</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${bills.map(b => `<tr>
          <td><span class="tmut">#${b.id}</span></td>
          <td><strong>${b.patient}</strong></td>
          <td>${Utils.formatDate(b.date)}</td>
          <td class="tmut">${b.desc || '—'}</td>
          <td><strong>₹${b.amount.toLocaleString()}</strong></td>
          <td class="tgreen">₹${(b.paid || 0).toLocaleString()}</td>
          <td style="color:${(b.amount-(b.paid||0)) > 0 ? 'var(--orange)' : 'var(--text3)'}">
            ₹${(b.amount - (b.paid || 0)).toLocaleString()}
          </td>
          <td>${Utils.statusBadge(b.status)}</td>
          <td><div class="actions-cell">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="BillingPage.openModal(${b.id})">✏️</button>
            <button class="btn btn-sm btn-danger    btn-icon" onclick="BillingPage.delete(${b.id})">🗑</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>`;
  },

  filter(q) { this.renderTable(q.toLowerCase()); },

  openModal(id) {
    const b   = id ? DB.load('billing').find(x => x.id === id) : null;
    const pts = DB.load('patients').map(p => `<option ${b?.patient===p.name?'selected':''}>${p.name}</option>`).join('');
    Utils.openModal(`
      <div class="modal-hd">
        <span class="modal-title">${b ? 'Edit Bill' : 'Add Bill'}</span>
        <button class="modal-x">×</button>
      </div>
      <div class="fg"><label class="flbl">Patient *</label>
        <select class="input" id="bl-patient">
          <option value="">Select patient</option>${pts}
        </select>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Total Amount (₹) *</label><input class="input" type="number" id="bl-amount" placeholder="0" value="${b?.amount||''}"/></div>
        <div class="fg"><label class="flbl">Amount Paid (₹)</label><input class="input" type="number" id="bl-paid" placeholder="0" value="${b?.paid||0}"/></div>
      </div>
      <div class="fr">
        <div class="fg"><label class="flbl">Date</label><input class="input" type="date" id="bl-date" value="${b?.date||new Date().toISOString().slice(0,10)}"/></div>
        <div class="fg"><label class="flbl">Status</label>
          <select class="input" id="bl-status">
            <option ${b?.status==='Paid'   ?'selected':''}>Paid</option>
            <option ${b?.status==='Pending'?'selected':''}>Pending</option>
            <option ${b?.status==='Partial'?'selected':''}>Partial</option>
          </select>
        </div>
      </div>
      <div class="fg"><label class="flbl">Description</label><input class="input" id="bl-desc" placeholder="e.g. Consultation + Tests" value="${b?.desc||''}"/></div>
      <div class="modal-ft">
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-primary"   onclick="BillingPage.save(${id||'null'})">💾 Save</button>
      </div>`);
  },

  save(id) {
    const patient = document.getElementById('bl-patient').value;
    const amount  = document.getElementById('bl-amount').value;
    if (!patient || patient === 'Select patient' || !amount) {
      Utils.toast('Patient and Amount are required', 'e'); return;
    }
    const bills = DB.load('billing');
    const data  = {
      patient, amount: +amount,
      paid:   +document.getElementById('bl-paid').value,
      date:   document.getElementById('bl-date').value,
      status: document.getElementById('bl-status').value,
      desc:   document.getElementById('bl-desc').value,
    };
    if (id) { const i = bills.findIndex(b => b.id === id); bills[i] = { ...bills[i], ...data }; }
    else bills.push({ id: DB.nextId('billing'), ...data });
    DB.save('billing', bills);
    Utils.closeModal();
    Utils.toast(id ? 'Bill updated' : 'Bill added');
    this.render();
  },

  delete(id) {
    if (!confirm('Delete this bill?')) return;
    DB.save('billing', DB.load('billing').filter(b => b.id !== id));
    Utils.toast('Bill deleted', 'i');
    this.render();
  }
};
