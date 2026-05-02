/* ═══════════════════════════════════════════════════════════
   api.js — MediCore Backend Integration Layer
   Hybrid: localStorage (instant UI) + Django REST (persistence)
   All endpoints mirror the backend urls.py routes.
   ═══════════════════════════════════════════════════════════ */

const API = {
  BASE: 'http://127.0.0.1:8000/api',
  _online: null,   // null = unknown, true/false after first ping

  /* ── Core HTTP helpers ──────────────────────────────── */
  async _fetch(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${this.BASE}/${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  get:    (path)        => API._fetch('GET',    path),
  post:   (path, data)  => API._fetch('POST',   path, data),
  put:    (path, data)  => API._fetch('PUT',    path, data),
  delete: (path)        => API._fetch('DELETE', path),

  /* ── Health check ───────────────────────────────────── */
  async ping() {
    try {
      await fetch(`${this.BASE}/dashboard/stats/`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      this._online = true;
    } catch {
      this._online = false;
      console.warn('[MediCore] Backend offline — running in offline mode');
    }
    return this._online;
  },

  /* ══════════════════════════════════════════════════════
     PATIENTS
  ══════════════════════════════════════════════════════ */
  patients: {
    list:   ()       => API.get('patients/'),
    get:    (id)     => API.get(`patients/${id}/`),
    create: (data)   => API.post('patients/', data),
    update: (id, d)  => API.put(`patients/${id}/`, d),
    delete: (id)     => API.delete(`patients/${id}/`),
    risk:   (id)     => API.get(`patients/${id}/risk/`),
  },

  /* ══════════════════════════════════════════════════════
     DOCTORS
  ══════════════════════════════════════════════════════ */
  doctors: {
    list:   ()       => API.get('doctors/'),
    get:    (id)     => API.get(`doctors/${id}/`),
    create: (data)   => API.post('doctors/', data),
    update: (id, d)  => API.put(`doctors/${id}/`, d),
    delete: (id)     => API.delete(`doctors/${id}/`),
  },

  /* ══════════════════════════════════════════════════════
     APPOINTMENTS
  ══════════════════════════════════════════════════════ */
  appointments: {
    list:    ()            => API.get('appointments/'),
    get:     (id)          => API.get(`appointments/${id}/`),
    create:  (data)        => API.post('appointments/', data),
    update:  (id, d)       => API.put(`appointments/${id}/`, d),
    delete:  (id)          => API.delete(`appointments/${id}/`),
    suggest: (doctor, date) => API.post('appointments/suggest/', { doctor, date }),
  },

  /* ══════════════════════════════════════════════════════
     INVENTORY
  ══════════════════════════════════════════════════════ */
  inventory: {
    list:   ()       => API.get('inventory/'),
    get:    (id)     => API.get(`inventory/${id}/`),
    create: (data)   => API.post('inventory/', data),
    update: (id, d)  => API.put(`inventory/${id}/`, d),
    delete: (id)     => API.delete(`inventory/${id}/`),
    alerts: ()       => API.get('inventory/alerts/'),
  },

  /* ══════════════════════════════════════════════════════
     BILLING
  ══════════════════════════════════════════════════════ */
  billing: {
    list:   ()       => API.get('billing/'),
    get:    (id)     => API.get(`billing/${id}/`),
    create: (data)   => API.post('billing/', data),
    update: (id, d)  => API.put(`billing/${id}/`, d),
    delete: (id)     => API.delete(`billing/${id}/`),
  },

  /* ══════════════════════════════════════════════════════
     DASHBOARD
  ══════════════════════════════════════════════════════ */
  dashboard: {
    stats: () => API.get('dashboard/stats/'),
  },
};


/* ═══════════════════════════════════════════════════════════
   HYBRID DB LAYER
   Overrides DB.load / DB.save so all pages automatically
   sync with the backend while still using localStorage as
   an instant cache.
   ═══════════════════════════════════════════════════════════ */

// Map localStorage keys → API resource objects
const _RESOURCE_MAP = {
  patients:     API.patients,
  doctors:      API.doctors,
  appointments: API.appointments,
  inventory:    API.inventory,
  billing:      API.billing,
};

// Original localStorage-based implementations (from data.js) are kept as
// the primary read path. We augment save() to also POST to the backend.

const _origSave = DB.save.bind(DB);

DB.save = async function(key, data) {
  // 1. Always save locally first (instant UI)
  _origSave(key, data);

  // 2. If backend is reachable, sync the latest item
  const resource = _RESOURCE_MAP[key];
  if (!resource || API._online === false) return;

  try {
    const latest = data[data.length - 1];
    if (!latest) return;
    if (latest.id && latest.id <= data.length) {
      // Likely an existing record being updated — find by id
      const existing = data.find(x => x.id === latest.id);
      if (existing) {
        await resource.update(latest.id, latest).catch(() => resource.create(latest));
      }
    } else {
      await resource.create(latest);
    }
  } catch (e) {
    console.warn(`[API] Sync failed for ${key}:`, e.message);
  }
};


/* ═══════════════════════════════════════════════════════════
   BACKEND SYNC — pulls latest data from backend into
   localStorage on startup, keeping UI always current.
   ═══════════════════════════════════════════════════════════ */

async function syncFromBackend() {
  const online = await API.ping();
  if (!online) return;

  const keys = ['patients', 'doctors', 'appointments', 'inventory', 'billing'];
  let synced = 0;

  for (const key of keys) {
    try {
      const data = await _RESOURCE_MAP[key].list();
      if (Array.isArray(data) && data.length > 0) {
        DB.set(key, data);      // overwrite localStorage with backend truth
        synced++;
      }
    } catch (e) {
      console.warn(`[API] Failed to sync ${key}:`, e.message);
    }
  }

  if (synced > 0) {
    Router.updateBadges();
    // Re-render current page with fresh data
    const page = Router.currentPage;
    if (page) Router.navigate(page);
    Utils.toast(`✅ Synced with backend (${synced} collections)`, 'i');
  }
}


/* ═══════════════════════════════════════════════════════════
   SMART SCHEDULING INTEGRATION
   Called from appointments page before saving.
   ═══════════════════════════════════════════════════════════ */

async function getScheduleSuggestion(doctor, date) {
  try {
    return await API.appointments.suggest(doctor, date);
  } catch {
    return null;
  }
}


/* ═══════════════════════════════════════════════════════════
   INVENTORY ALERTS INTEGRATION
   Called from inventory page to show ML reorder alerts.
   ═══════════════════════════════════════════════════════════ */

async function getInventoryAlerts() {
  try {
    return await API.inventory.alerts();
  } catch {
    return null;
  }
}


/* ═══════════════════════════════════════════════════════════
   BOOT — run sync after DOM is ready
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Small delay so DB.init() and Router.init() run first (from app.js)
  setTimeout(syncFromBackend, 500);
});
