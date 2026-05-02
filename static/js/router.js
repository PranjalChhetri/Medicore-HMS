/* ═══════════════════════════════════════════════════════════
   router.js — Page navigation and global search
   ═══════════════════════════════════════════════════════════ */

const Router = {
  currentPage: 'dashboard',

  PAGE_META: {
    dashboard:   { title:'Dashboard',        sub:'Overview & quick actions' },
    patients:    { title:'Patients',          sub:'Manage patient records' },
    doctors:     { title:'Doctors',           sub:'Medical staff directory' },
    appointments:{ title:'Appointments',      sub:'Schedule & track visits' },
    inventory:   { title:'Inventory',         sub:'Medical supplies & equipment' },
    billing:     { title:'Billing',           sub:'Financial records' },
    prediction:  { title:'AI Disease Prediction', sub:'AI-powered clinical risk assessment' },
    analytics:   { title:'Analytics',         sub:'Reports & insights' },
  },

  navigate(page) {
    this.currentPage = page;

    // Hide all pages, show target
    document.querySelectorAll('.page-wrap').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });

    // Update topbar title
    const m = this.PAGE_META[page] || { title: page, sub: '' };
    document.getElementById('topbar-title').innerHTML = `${m.title}<small>${m.sub}</small>`;

    // Render the page
    const renderers = {
      dashboard:    () => DashboardPage.render(),
      patients:     () => PatientsPage.render(),
      doctors:      () => DoctorsPage.render(),
      appointments: () => AppointmentsPage.render(),
      inventory:    () => InventoryPage.render(),
      billing:      () => BillingPage.render(),
      prediction:   () => PredictionPage.render(),
      analytics:    () => AnalyticsPage.render(),
      settings:     () => SettingsPage.render(),
    };
    renderers[page]?.();
  },

  init() {
    // Bind sidebar nav buttons
    document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
      b.addEventListener('click', () => this.navigate(b.dataset.page));
    });

    // Global search — redirect to patients page
    document.getElementById('global-search').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      this.navigate('patients');
      setTimeout(() => {
        const si = document.getElementById('pat-search');
        if (si) { si.value = q; si.dispatchEvent(new Event('input')); }
      }, 60);
    });

    // Initial page
    this.navigate('dashboard');
  },

  updateBadges() {
    const pts = DB.load('patients');
    document.getElementById('nb-patients').textContent = pts.length;

    const inv = DB.load('inventory');
    const lowCount = inv.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length;
    const nb = document.getElementById('nb-inventory');
    nb.style.display = lowCount ? '' : 'none';
    nb.textContent   = lowCount || '';
  }
};
