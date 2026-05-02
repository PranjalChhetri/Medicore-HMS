/* ═══════════════════════════════════════════════════════════
   utils.js — Shared helper functions used across all pages
   ═══════════════════════════════════════════════════════════ */

const Utils = {

  /* ── Avatar helpers ──────────────────────────────────── */
  avatarColor(name) {
    const colors = ['#0dd4b2','#3b83f7','#8b5cf6','#ec4899','#f59e42','#22d3a3','#f04060'];
    let h = 0;
    for (let c of name) h = (h + c.charCodeAt(0)) % colors.length;
    return colors[h];
  },

  initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  },

  /* ── Date formatting ─────────────────────────────────── */
  formatDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
    catch { return d; }
  },

  /* ── Status badge HTML ───────────────────────────────── */
  statusBadge(s) {
    const map = {
      'Active':'b-green', 'On Leave':'b-orange', 'Inactive':'b-gray',
      'Scheduled':'b-blue', 'Completed':'b-green', 'Cancelled':'b-red',
      'Paid':'b-green', 'Pending':'b-orange', 'Partial':'b-purple',
      'In Stock':'b-green', 'Low Stock':'b-orange', 'Critical':'b-red', 'Out of Stock':'b-gray',
      'Male':'b-blue', 'Female':'b-pink', 'Other':'b-gray'
    };
    return `<span class="badge ${map[s] || 'b-gray'}">${s}</span>`;
  },

  /* ── Avatar HTML ─────────────────────────────────────── */
  avatarHtml(name) {
    return `<div class="av" style="background:${this.avatarColor(name)}">${this.initials(name)}</div>`;
  },

  /* ── Toast notification ──────────────────────────────── */
  toast(msg, type = 's') {
    const icons = { s:'✅', e:'❌', i:'ℹ️' };
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },

  /* ── Modal open / close ──────────────────────────────── */
  openModal(html) {
    const box = document.getElementById('modal-box');
    box.innerHTML = html;
    document.getElementById('modal-overlay').classList.add('open');
    box.querySelector('.modal-x')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) this.closeModal();
    }, { once: true });
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
  }
};
