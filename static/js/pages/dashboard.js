/* ═══════════════════════════════════════════════════════════
   pages/dashboard.js — Dashboard page  
   ═══════════════════════════════════════════════════════════ */

const DashboardPage = {
  charts: {},
  render() {
    const pts = DB.load('patients') || [];
    const docs = DB.load('doctors') || [];
    const apts = DB.load('appointments') || [];
    const bills = DB.load('billing') || [];
    const revenue = bills.reduce((s, b) => s + (b.status === 'Paid' ? b.amount : 0), 0);
    const scheduled = apts.filter(a => a.status === 'Scheduled').length;
    const activeDocs = docs.filter(d => d.status === 'Active').length;

    document.getElementById('page-dashboard').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card c-cyan">
          <div class="stat-icon">👥</div>
          <div class="stat-lbl">Total Patients</div>
          <div class="stat-val">${pts.length}</div>
          <div class="stat-delta">↑ ${Math.floor(pts.length * 0.1)} this month</div>
        </div>
        <div class="stat-card c-blue">
          <div class="stat-icon">📅</div>
          <div class="stat-lbl">Appointments</div>
          <div class="stat-val">${scheduled}</div>
          <div class="stat-delta">↑ Scheduled</div>
        </div>
        <div class="stat-card c-green">
          <div class="stat-icon">🩺</div>
          <div class="stat-lbl">Active Doctors</div>
          <div class="stat-val">${activeDocs}</div>
          <div class="stat-delta">↑ On duty</div>
        </div>
        <div class="stat-card c-orange">
          <div class="stat-icon">💰</div>
          <div class="stat-lbl">Revenue</div>
          <div class="stat-val">₹${(revenue / 1000).toFixed(1)}K</div>
          <div class="stat-delta">↑ 12%</div>
        </div>
      </div>

      <div class="g2" style="margin-top:20px">
        <div class="chart-card">
          <div class="ch-title">Appointments - Last 7 Days</div>
          <div class="ch-sub">Scheduled vs Completed</div>
          <div class="ch-wrap-lg"><canvas id="ch-apts"></canvas></div>
        </div>
        <div class="card">
          <div class="fac fjb mb20">
            <span class="fw7">Recent Patients</span>
            <button class="btn btn-sm btn-secondary" onclick="Router.navigate('patients')">View All</button>
          </div>
          ${pts.slice(0, 5).map(p => '<div class="activity-item"><div class="adot ' + ['cyan','blue','green','orange','red'][p.id % 5] + '"></div><div class="ainfo"><div class="aname">' + p.name + '</div><div class="atime">' + (p.condition || 'General') + ' · Age ' + p.age + '</div></div></div>').join('')}
        </div>
      </div>

      <div class="g3">
        <div class="chart-card">
          <div class="ch-title">Patients by Gender</div>
          <div class="ch-sub">Distribution</div>
          <div class="ch-wrap"><canvas id="ch-gender"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="ch-title">Inventory Status</div>
          <div class="ch-sub">Stock overview</div>
          <div class="ch-wrap"><canvas id="ch-inv"></canvas></div>
        </div>
        <div class="card">
          <div class="fw7 mb20">Top Conditions</div>
          ${this._getTopConditions(pts).map(c => '<div class="kpi-item"><div class="kpi-lbl">' + c[0] + '</div><div class="kpi-bar-bg"><div class="kpi-bar-fg" style="width:' + c[2] + '%;background:var(--cyan)"></div></div><div class="kpi-num">' + c[1] + '</div></div>').join('')}
        </div>
      </div>

      <div class="g2">
        <div class="card">
          <div class="fw7 mb20">Pending Bills</div>
          ${bills.filter(b => b.status !== 'Paid').map(b => '<div class="fac fjb" style="padding:8px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;font-weight:500">' + b.patient + '</div><div style="font-size:11px;color:var(--text3)">' + b.desc + '</div></div><span style="font-weight:700;color:var(--orange)">₹' + b.amount + '</span></div>').join('') || '<div style="color:var(--text3);text-align:center;padding:20px">✅ All bills cleared</div>'}
        </div>
        <div class="card">
          <div class="fw7 mb20">Quick Actions</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('patients')">👤 Patients</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('appointments')">📅 Appointments</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('doctors')">👨‍⚕️ Doctors</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('inventory')">📦 Inventory</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('billing')">💳 Billing</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('prediction')">🤖 Predict</button>
          </div>
        </div>
      </div>
    `;

    this._initCharts();
  },

  _getTopConditions(pts) {
    const map = {};
    pts.forEach(p => { if (p.condition) map[p.condition] = (map[p.condition] || 0) + 1; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = Math.max(1, ...(sorted.map(s => s[1]) || [1]));
    return sorted.map(s => [s[0], s[1], Math.round(s[1] / max * 100)]);
  },

  _initCharts() {
    if (typeof Chart === 'undefined') return;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    ['apts', 'gender', 'inv'].forEach(k => { if (this.charts[k]) this.charts[k].destroy(); });

    this.charts.apts = new Chart(document.getElementById('ch-apts'), {
      type: 'bar',
      data: { labels: days, datasets: [
        { label: 'Scheduled', data: [3,5,4,6,7,2,5], backgroundColor: 'rgba(59,131,247,.7)', borderRadius: 4 },
        { label: 'Completed', data: [2,4,3,5,6,1,4], backgroundColor: 'rgba(13,212,178,.7)', borderRadius: 4 },
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }}, scales: { y: { beginAtZero: true }}}
    });

    const genders = { Male: 0, Female: 0, Other: 0 };
    (DB.load('patients') || []).forEach(p => { genders[p.gender] = (genders[p.gender] || 0) + 1; });
    this.charts.gender = new Chart(document.getElementById('ch-gender'), {
      type: 'doughnut',
      data: { labels: ['Male', 'Female', 'Other'], datasets: [{ data: Object.values(genders), backgroundColor: ['rgba(59,131,247,.8)', 'rgba(236,72,153,.8)', 'rgba(139,92,246,.8)'], borderWidth: 0 }]},
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom' }}}
    });

    const statuses = { 'In Stock': 0, 'Low Stock': 0, 'Critical': 0 };
    (DB.load('inventory') || []).forEach(i => { statuses[i.status] = (statuses[i.status] || 0) + 1; });
    this.charts.inv = new Chart(document.getElementById('ch-inv'), {
      type: 'doughnut',
      data: { labels: Object.keys(statuses), datasets: [{ data: Object.values(statuses), backgroundColor: ['rgba(34,211,163,.8)', 'rgba(245,158,66,.8)', 'rgba(240,64,96,.8)'], borderWidth: 0 }]},
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom' }}}
    });
  }
};
