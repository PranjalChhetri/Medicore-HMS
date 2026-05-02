/* ═══════════════════════════════════════════════════════════
   pages/analytics.js — Analytics & Charts page
   ═══════════════════════════════════════════════════════════ */

const AnalyticsPage = {
  charts: {},

  render() {
    const pts   = DB.load('patients');
    const apts  = DB.load('appointments');
    const bills = DB.load('billing');
    const inv   = DB.load('inventory');

    document.getElementById('page-analytics').innerHTML = `
      <div class="page-hd"><div><h2>Analytics</h2><div class="meta">Hospital performance insights</div></div></div>

      <div class="stats-grid">
        <div class="stat-card c-cyan">
          <div class="stat-icon">📋</div>
          <div class="stat-lbl">Total Appointments</div>
          <div class="stat-val">${apts.length}</div>
        </div>
        <div class="stat-card c-green">
          <div class="stat-icon">✅</div>
          <div class="stat-lbl">Completed</div>
          <div class="stat-val">${apts.filter(a => a.status === 'Completed').length}</div>
        </div>
        <div class="stat-card c-orange">
          <div class="stat-icon">⏳</div>
          <div class="stat-lbl">Pending Bills</div>
          <div class="stat-val">${bills.filter(b => b.status !== 'Paid').length}</div>
        </div>
        <div class="stat-card c-purple">
          <div class="stat-icon">📦</div>
          <div class="stat-lbl">Inventory Items</div>
          <div class="stat-val">${inv.length}</div>
        </div>
      </div>

      <div class="g2">
        <div class="chart-card">
          <div class="ch-title">Patient Age Distribution</div>
          <div class="ch-sub">Breakdown by age group</div>
          <div class="ch-wrap-lg"><canvas id="ch-age"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="ch-title">Appointment Status</div>
          <div class="ch-sub">Current period overview</div>
          <div class="ch-wrap-lg"><canvas id="ch-aptstatus"></canvas></div>
        </div>
      </div>

      <div class="g21">
        <div class="chart-card">
          <div class="ch-title">Monthly Revenue (₹)</div>
          <div class="ch-sub">Last 6 months</div>
          <div class="ch-wrap-lg"><canvas id="ch-revenue"></canvas></div>
        </div>
        <div class="card">
          <div class="fw7" style="margin-bottom:14px">Department Load</div>
          ${[['Cardiology',68],['General OPD',92],['Neurology',45],['Orthopedics',57],['Oncology',38]].map(([d, v]) => `
            <div class="kpi-item">
              <div class="kpi-lbl">${d}</div>
              <div class="kpi-bar-bg"><div class="kpi-bar-fg" style="width:${v}%;background:var(--cyan)"></div></div>
              <div class="kpi-num">${v}%</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="g2">
        <div class="chart-card">
          <div class="ch-title">Top Medical Conditions</div>
          <div class="ch-sub">Patient condition distribution</div>
          <div class="ch-wrap-lg"><canvas id="ch-conditions"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="ch-title">Inventory by Category</div>
          <div class="ch-sub">Stock distribution</div>
          <div class="ch-wrap-lg"><canvas id="ch-invcat"></canvas></div>
        </div>
      </div>`;

    this._initCharts(pts, apts, bills, inv);
  },

  _initCharts(pts, apts, bills, inv) {
    const C = Chart;
    C.defaults.color = 'rgba(221,233,248,.7)';
    C.defaults.font  = { family:'Outfit', size:11 };

    const gridOpts = { color:'rgba(79,136,220,.08)' };
    const noLegend = { legend:{ display:false } };

    // ── Age distribution ──────────────────────────────────
    const ag = { '0-18':0, '19-35':0, '36-50':0, '51-65':0, '65+':0 };
    pts.forEach(p => {
      if      (p.age <= 18) ag['0-18']++;
      else if (p.age <= 35) ag['19-35']++;
      else if (p.age <= 50) ag['36-50']++;
      else if (p.age <= 65) ag['51-65']++;
      else                  ag['65+']++;
    });
    if (this.charts.age) this.charts.age.destroy();
    this.charts.age = new C(document.getElementById('ch-age'), {
      type: 'bar',
      data: { labels: Object.keys(ag), datasets:[{ data: Object.values(ag),
        backgroundColor:['rgba(13,212,178,.7)','rgba(59,131,247,.7)','rgba(139,92,246,.7)','rgba(245,158,66,.7)','rgba(240,64,96,.7)'],
        borderRadius:6, borderSkipped:false }]},
      options: { responsive:true, maintainAspectRatio:false, plugins: noLegend,
        scales: { x:{ grid: gridOpts }, y:{ grid: gridOpts }}}
    });

    // ── Appointment status ────────────────────────────────
    const as = { Scheduled:0, Completed:0, Cancelled:0 };
    apts.forEach(a => { as[a.status] = (as[a.status] || 0) + 1; });
    if (this.charts.aptstatus) this.charts.aptstatus.destroy();
    this.charts.aptstatus = new C(document.getElementById('ch-aptstatus'), {
      type: 'doughnut',
      data: { labels: Object.keys(as), datasets:[{ data: Object.values(as),
        backgroundColor:['rgba(59,131,247,.8)','rgba(34,211,163,.8)','rgba(240,64,96,.8)'],
        borderWidth:0, hoverOffset:8 }]},
      options: { responsive:true, maintainAspectRatio:false, cutout:'60%',
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, padding:12 }}}}
    });

    // ── Monthly revenue ───────────────────────────────────
    const months  = ['Jul','Aug','Sep','Oct','Nov','Dec'];
    const paidNow = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
    const revData = [18400, 22100, 19800, 25600, 31200, paidNow];
    if (this.charts.revenue) this.charts.revenue.destroy();
    this.charts.revenue = new C(document.getElementById('ch-revenue'), {
      type: 'line',
      data: { labels: months, datasets:[{ data: revData,
        borderColor:'var(--cyan)', backgroundColor:'rgba(13,212,178,.08)',
        fill:true, tension:.4, pointBackgroundColor:'var(--cyan)', pointRadius:4 }]},
      options: { responsive:true, maintainAspectRatio:false, plugins: noLegend,
        scales: { x:{ grid: gridOpts }, y:{ grid: gridOpts, ticks:{ callback: v => '₹' + (v/1000).toFixed(0) + 'K' }}}}
    });

    // ── Top conditions ────────────────────────────────────
    const cm = {};
    pts.forEach(p => { if (p.condition) cm[p.condition] = (cm[p.condition] || 0) + 1; });
    const topC = Object.entries(cm).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (this.charts.conditions) this.charts.conditions.destroy();
    this.charts.conditions = new C(document.getElementById('ch-conditions'), {
      type: 'bar',
      data: { labels: topC.map(c => c[0]), datasets:[{ data: topC.map(c => c[1]),
        backgroundColor:'rgba(139,92,246,.7)', borderRadius:5, borderSkipped:false }]},
      options: { responsive:true, maintainAspectRatio:false, indexAxis:'y', plugins: noLegend,
        scales: { x:{ grid: gridOpts }, y:{ grid:{ display:false }}}}
    });

    // ── Inventory by category ─────────────────────────────
    const vc = {};
    inv.forEach(i => { vc[i.category] = (vc[i.category] || 0) + 1; });
    if (this.charts.invcat) this.charts.invcat.destroy();
    this.charts.invcat = new C(document.getElementById('ch-invcat'), {
      type: 'doughnut',
      data: { labels: Object.keys(vc), datasets:[{ data: Object.values(vc),
        backgroundColor:['rgba(13,212,178,.8)','rgba(59,131,247,.8)','rgba(245,158,66,.8)','rgba(139,92,246,.8)','rgba(236,72,153,.8)'],
        borderWidth:0, hoverOffset:6 }]},
      options: { responsive:true, maintainAspectRatio:false, cutout:'55%',
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:11, padding:10 }}}}
    });
  }
};
