/* ═══════════════════════════════════════════════════════════
   settings.js — System Settings Management
   Manages Organization, Appointments, Inventory, Billing,
   Predictions, UI, and Notification preferences.
   ═══════════════════════════════════════════════════════════ */

const SettingsPage = {
  currentTab: 'organization',
  settings: {},
  unsavedChanges: false,

  render() {
    this.loadSettings();
    this.renderTabs();
    this.renderCurrentTab();
    this.bindEvents();
  },

  async loadSettings() {
    try {
      this.settings = await API.get('settings/');
    } catch (e) {
      console.warn('[Settings] Failed to load:', e.message);
      this.settings = this.getDefaults();
    }
  },

  getDefaults() {
    return {
      clinic_name: 'MediCore HMS',
      clinic_address: '',
      clinic_phone: '',
      clinic_email: '',
      operating_hours: '09:00-18:00',
      appointment_slot_duration: 30,
      max_appointments_per_day: 20,
      advance_booking_days: 30,
      default_low_stock_threshold: 10,
      default_reorder_quantity: 50,
      auto_reorder_enabled: true,
      default_consultation_fee: 500,
      tax_percentage: 18,
      currency: 'INR',
      high_risk_threshold: 70,
      moderate_risk_threshold: 40,
      save_prediction_history: true,
      theme: 'dark',
      date_format: 'DD-MM-YYYY',
      items_per_page: 10,
      email_alerts: true,
      sms_alerts: false,
      push_notifications: true,
    };
  },

  renderTabs() {
    const tabs = ['organization', 'appointments', 'inventory', 'billing', 'predictions', 'ui', 'notifications'];
    const tabsHtml = tabs.map(t => `
      <button class="settings-tab ${t === this.currentTab ? 'active' : ''}" 
              data-tab="${t}" onclick="SettingsPage.switchTab('${t}')">
        ${this.getTabIcon(t)} ${this.getTabLabel(t)}
      </button>
    `).join('');

    document.getElementById('settings-tabs').innerHTML = tabsHtml;
  },

  getTabIcon(tab) {
    const icons = {
      organization: '🏥',
      appointments: '📅',
      inventory: '📦',
      billing: '💰',
      predictions: '🤖',
      ui: '🎨',
      notifications: '🔔',
    };
    return icons[tab] || '⚙️';
  },

  getTabLabel(tab) {
    const labels = {
      organization: 'Organization',
      appointments: 'Appointments',
      inventory: 'Inventory',
      billing: 'Billing',
      predictions: 'Predictions',
      ui: 'UI & Display',
      notifications: 'Notifications',
    };
    return labels[tab];
  },

  switchTab(tab) {
    if (this.unsavedChanges) {
      if (!confirm('You have unsaved changes. Continue without saving?')) return;
      this.unsavedChanges = false;
    }
    this.currentTab = tab;
    this.renderTabs();
    this.renderCurrentTab();
  },

  renderCurrentTab() {
    const tabContent = {
      organization: this.renderOrganization.bind(this),
      appointments: this.renderAppointments.bind(this),
      inventory: this.renderInventory.bind(this),
      billing: this.renderBilling.bind(this),
      predictions: this.renderPredictions.bind(this),
      ui: this.renderUI.bind(this),
      notifications: this.renderNotifications.bind(this),
    };

    const content = tabContent[this.currentTab]?.();
    document.getElementById('settings-content').innerHTML = content || '';
    this.bindEvents();
  },

  renderOrganization() {
    return `
      <div class="settings-form">
        <h3>🏥 Organization Settings</h3>
        <div class="form-group">
          <label>Clinic Name</label>
          <input type="text" id="clinic_name" value="${this.settings.clinic_name || ''}" placeholder="Enter clinic name">
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea id="clinic_address" placeholder="Enter clinic address">${this.settings.clinic_address || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="clinic_phone" value="${this.settings.clinic_phone || ''}" placeholder="+91 98765 43210">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="clinic_email" value="${this.settings.clinic_email || ''}" placeholder="info@clinic.com">
          </div>
        </div>
        <div class="form-group">
          <label>Operating Hours</label>
          <input type="text" id="operating_hours" value="${this.settings.operating_hours || ''}" placeholder="09:00-18:00">
          <small>Format: HH:MM-HH:MM</small>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  renderAppointments() {
    return `
      <div class="settings-form">
        <h3>📅 Appointment Settings</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Slot Duration (minutes)</label>
            <input type="number" id="appointment_slot_duration" value="${this.settings.appointment_slot_duration || 30}" min="5" max="120">
          </div>
          <div class="form-group">
            <label>Max Appointments/Day</label>
            <input type="number" id="max_appointments_per_day" value="${this.settings.max_appointments_per_day || 20}" min="1" max="100">
          </div>
          <div class="form-group">
            <label>Advance Booking (days)</label>
            <input type="number" id="advance_booking_days" value="${this.settings.advance_booking_days || 30}" min="1" max="365">
          </div>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  renderInventory() {
    return `
      <div class="settings-form">
        <h3>📦 Inventory Settings</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Low Stock Threshold</label>
            <input type="number" id="default_low_stock_threshold" value="${this.settings.default_low_stock_threshold || 10}" min="1">
          </div>
          <div class="form-group">
            <label>Default Reorder Quantity</label>
            <input type="number" id="default_reorder_quantity" value="${this.settings.default_reorder_quantity || 50}" min="1">
          </div>
        </div>
        <div class="form-group checkbox">
          <input type="checkbox" id="auto_reorder_enabled" ${this.settings.auto_reorder_enabled ? 'checked' : ''}>
          <label for="auto_reorder_enabled">Enable Auto-Reorder Alerts</label>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  renderBilling() {
    return `
      <div class="settings-form">
        <h3>💰 Billing Settings</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Default Consultation Fee (₹)</label>
            <input type="number" id="default_consultation_fee" value="${this.settings.default_consultation_fee || 500}" min="0" step="100">
          </div>
          <div class="form-group">
            <label>Tax Percentage (%)</label>
            <input type="number" id="tax_percentage" value="${this.settings.tax_percentage || 18}" min="0" max="100" step="0.5">
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select id="currency">
              <option value="INR" ${this.settings.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
              <option value="USD" ${this.settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
              <option value="EUR" ${this.settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
            </select>
          </div>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  renderPredictions() {
    return `
      <div class="settings-form">
        <h3>🤖 Predictions & ML Settings</h3>
        <div class="form-row">
          <div class="form-group">
            <label>High Risk Threshold (%)</label>
            <input type="number" id="high_risk_threshold" value="${this.settings.high_risk_threshold || 70}" min="0" max="100">
          </div>
          <div class="form-group">
            <label>Moderate Risk Threshold (%)</label>
            <input type="number" id="moderate_risk_threshold" value="${this.settings.moderate_risk_threshold || 40}" min="0" max="100">
          </div>
        </div>
        <div class="form-group checkbox">
          <input type="checkbox" id="save_prediction_history" ${this.settings.save_prediction_history ? 'checked' : ''}>
          <label for="save_prediction_history">Save Prediction History</label>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  renderUI() {
    return `
      <div class="settings-form">
        <h3>🎨 UI & Display Settings</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Theme</label>
            <select id="theme">
              <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
              <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date Format</label>
            <select id="date_format">
              <option value="DD-MM-YYYY" ${this.settings.date_format === 'DD-MM-YYYY' ? 'selected' : ''}>DD-MM-YYYY</option>
              <option value="MM-DD-YYYY" ${this.settings.date_format === 'MM-DD-YYYY' ? 'selected' : ''}>MM-DD-YYYY</option>
              <option value="YYYY-MM-DD" ${this.settings.date_format === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
            </select>
          </div>
          <div class="form-group">
            <label>Items Per Page</label>
            <input type="number" id="items_per_page" value="${this.settings.items_per_page || 10}" min="5" max="100" step="5">
          </div>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  renderNotifications() {
    return `
      <div class="settings-form">
        <h3>🔔 Notification Settings</h3>
        <div class="form-group checkbox">
          <input type="checkbox" id="email_alerts" ${this.settings.email_alerts ? 'checked' : ''}>
          <label for="email_alerts">📧 Email Alerts</label>
        </div>
        <div class="form-group checkbox">
          <input type="checkbox" id="sms_alerts" ${this.settings.sms_alerts ? 'checked' : ''}>
          <label for="sms_alerts">📱 SMS Alerts</label>
        </div>
        <div class="form-group checkbox">
          <input type="checkbox" id="push_notifications" ${this.settings.push_notifications ? 'checked' : ''}>
          <label for="push_notifications">🔔 Push Notifications</label>
        </div>
        <button class="btn-primary" onclick="SettingsPage.saveSettings()">Save Changes</button>
      </div>
    `;
  },

  async saveSettings() {
    const payload = {};
    const fields = [
      'clinic_name', 'clinic_address', 'clinic_phone', 'clinic_email', 'operating_hours',
      'appointment_slot_duration', 'max_appointments_per_day', 'advance_booking_days',
      'default_low_stock_threshold', 'default_reorder_quantity', 'auto_reorder_enabled',
      'default_consultation_fee', 'tax_percentage', 'currency',
      'high_risk_threshold', 'moderate_risk_threshold', 'save_prediction_history',
      'theme', 'date_format', 'items_per_page',
      'email_alerts', 'sms_alerts', 'push_notifications'
    ];

    fields.forEach(field => {
      const el = document.getElementById(field);
      if (el) {
        if (el.type === 'checkbox') {
          payload[field] = el.checked;
        } else {
          const val = el.value;
          payload[field] = isNaN(val) ? val : parseFloat(val);
        }
      }
    });

    try {
      await API.put('settings/', payload);
      this.unsavedChanges = false;
      Utils.toast('Settings saved successfully!', 's');
      this.loadSettings();
    } catch (e) {
      Utils.toast(`Error: ${e.message}`, 'e');
    }
  },

  bindEvents() {
    // Mark as unsaved when any input changes
    document.querySelectorAll('.settings-form input, .settings-form textarea, .settings-form select').forEach(el => {
      el.addEventListener('change', () => {
        this.unsavedChanges = true;
      });
    });
  }
};
