/* ═══════════════════════════════════════════════════════════
   notif.js — Real-time Notification System
   ═══════════════════════════════════════════════════════════ */

window.Notif = {
  list: [],

  init() {
    console.log('[Notif] Initializing notification system...');
    const btn = document.getElementById('btn-notif');
    const panel = document.getElementById('notif-panel');

    if (!btn || !panel) {
      console.warn('[Notif] Header buttons not found. Retrying in 1s...');
      setTimeout(() => this.init(), 1000);
      return;
    }

    // Toggle panel
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle('open');
      btn.classList.remove('notif-dot');
      
      if (isOpen) {
        HMS.toast('Opening Notification Center...', 'i');
      }
      console.log('[Notif] Panel toggled', isOpen);
    });

    // Close on click outside
    document.addEventListener('click', () => {
      if (panel.classList.contains('open')) {
        panel.classList.remove('open');
      }
    });
    
    panel.addEventListener('click', (e) => e.stopPropagation());

    // Add some sample notifications for the demo
    this.add('🏥 System ready for clinical use.', 'info');
    this.add('📦 Inventory Check: Paracetamol is at 15% stock.', 'warn');
  },

  add(msg, type = 'info') {
    const n = {
      id: Date.now(),
      msg,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.list.unshift(n);
    if (this.list.length > 10) this.list.pop(); 
    
    this.render();
    
    // Pulse the bell icon if the panel is closed
    const btn = document.getElementById('btn-notif');
    const panel = document.getElementById('notif-panel');
    if (panel && btn && !panel.classList.contains('open')) {
      btn.classList.add('notif-dot');
    }
  },

  render() {
    const container = document.getElementById('notif-panel-list');
    if (!container) return;

    if (this.list.length === 0) {
      container.innerHTML = '<div class="empty">No new alerts</div>';
      return;
    }

    container.innerHTML = this.list.map(n => `
      <div class="notif-item ${n.type}">
        <div class="notif-msg">${n.msg}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    `).join('');
  },

  clearAll() {
    this.list = [];
    this.render();
    document.getElementById('btn-notif').classList.remove('notif-dot');
  }
};
