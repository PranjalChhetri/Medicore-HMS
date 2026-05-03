/* ═══════════════════════════════════════════════════════════
   pages/dashboard.js — Dashboard page  
   ═══════════════════════════════════════════════════════════ */

window.DashboardPage = {
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
          <div class="stat-report-icon pulse-report" data-type="Patients">📑</div>
          <div class="stat-icon">👥</div>
          <div class="stat-lbl">Total Patients</div>
          <div class="stat-val">${pts.length}</div>
          <div class="stat-delta">↑ ${Math.floor(pts.length * 0.1)} this month</div>
        </div>
        <div class="stat-card c-blue">
          <div class="stat-report-icon pulse-report" data-type="Appointments">📑</div>
          <div class="stat-icon">📅</div>
          <div class="stat-lbl">Appointments</div>
          <div class="stat-val">${scheduled}</div>
          <div class="stat-delta">↑ Scheduled</div>
        </div>
        <div class="stat-card c-green">
          <div class="stat-report-icon pulse-report" data-type="Doctors">📑</div>
          <div class="stat-icon">🩺</div>
          <div class="stat-lbl">Active Doctors</div>
          <div class="stat-val">${activeDocs}</div>
          <div class="stat-delta">↑ On duty</div>
        </div>
        <div class="stat-card c-orange">
          <div class="stat-report-icon pulse-report" data-type="Revenue">📑</div>
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
          <div class="fw7 mb20">🛡️ Pharmacy Safety Checker</div>
          <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px; border:1px solid var(--border)">
            <label class="flbl">Enter Medicines (comma separated)</label>
            <div class="fac gap8">
              <input class="input" id="safety-input" placeholder="e.g. Aspirin, Warfarin" style="flex:1" />
              <button class="btn btn-primary" onclick="DashboardPage.checkSafety()">Check</button>
            </div>
            <div id="safety-result" style="margin-top:12px; display:none"></div>
          </div>
        </div>
        <div class="card">
          <div class="fw7 mb20">Quick Navigation</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('patients')">👤 Patients</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('appointments')">📅 Appointments</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('prediction')">🤖 AI Predict</button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="Router.navigate('inventory')">📦 Inventory</button>
          </div>
        </div>
      </div>
    `;

    this._initCharts();
    this._bindEvents();
  },

  checkSafety() {
    const input = document.getElementById('safety-input').value;
    const drugs = input.split(',').filter(d => d.trim());
    if (drugs.length < 2) {
      Utils.toast('Please enter at least 2 medicines to check.', 'i');
      return;
    }

    const conflicts = window.Safety.checkConflicts(drugs);
    const resultEl = document.getElementById('safety-result');
    resultEl.style.display = 'block';

    if (conflicts.length === 0) {
      resultEl.innerHTML = `
        <div style="background:rgba(34,211,163,0.1); padding:10px; border-radius:8px; border:1px solid rgba(34,211,163,0.3); color:var(--green); font-size:13px">
          ✅ No known interactions found for these medicines.
        </div>`;
    } else {
      resultEl.innerHTML = conflicts.map(c => `
        <div style="background:rgba(240,64,96,0.1); padding:10px; border-radius:8px; border:1px solid rgba(240,64,96,0.3); color:var(--red); font-size:12.5px; margin-bottom:6px">
          <strong>⚠️ ${c.level} Interaction:</strong> ${c.msg}
        </div>`).join('');
      
      Notif.add(`🛡️ Safety Alert: Potential drug conflict detected.`, 'error');
    }
  },

  _bindEvents() {
    // Bulletproof Event Delegation
    const page = document.getElementById('page-dashboard');
    page.onclick = (e) => {
      const icon = e.target.closest('.stat-report-icon');
      if (icon) {
        e.stopPropagation();
        const type = icon.getAttribute('data-type');
        this.showInsight(type);
      }
    };
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
  },

  showInsight(type) {
    const insights = {
      'Patients': {
        title: 'Patient Analytics Report',
        msg: 'Our **MediCore Intelligence** models indicate a 12% rise in outpatient volume. Predicted wait time reduction of **18 minutes** is expected following the new ER Triage protocol.',
        color: 'var(--cyan)'
      },
      'Appointments': {
        title: 'Operational Schedule Analysis',
        msg: 'Mondays are identified as high-density periods. Automated SMS follow-ups have successfully reduced "No-Shows" by **18%**, optimizing doctor availability.',
        color: 'var(--blue)'
      },
      'Doctors': {
        title: 'Clinical Staff Performance',
        msg: 'Current staff utilization is at **82%**. Dr. Sharma and Dr. Verma have the highest patient satisfaction scores. Recommendation: Allocate additional support to Cardiology on Fridays.',
        color: 'var(--green)'
      },
      'Revenue': {
        title: 'Financial Health Insight',
        msg: 'Revenue cycles have shortened by 4 days. Automated billing follow-ups have reduced outstanding payments by **₹14.2K** this month.',
        color: 'var(--orange)'
      }
    };
    
    const data = insights[type];
    const html = `
      <div class="modal-hd">
        <h2 style="color:${data.color}">${data.title}</h2>
        <button class="modal-x">&times;</button>
      </div>
      <div class="modal-body">
        <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border-left:4px solid ${data.color}">
          <p style="font-size:15px; line-height:1.6; color:var(--text2)">${data.msg}</p>
        </div>
        <div style="margin-top:20px; text-align:right">
          <button class="btn btn-secondary modal-x">Close Report</button>
        </div>
      </div>
    `;
    
    window.Utils.openModal(html);
  }
};
