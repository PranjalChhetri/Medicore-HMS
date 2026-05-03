/* ═══════════════════════════════════════════════════════════
   pages/inventory.js — Inventory Management (Fixed)
   ═══════════════════════════════════════════════════════════ */

const InventoryPage = {
  render() {
    try {
      let inv = DB.load('inventory') || [];
      if (!Array.isArray(inv)) inv = [];

      document.getElementById('page-inventory').innerHTML = `
        <div class="page-hd">
          <div><h2>Inventory</h2><div class="meta">${inv.length} items</div></div>
          <div class="fac gap8">
            <button class="btn btn-secondary" onclick="InventoryPage.runMLAlerts()">🤖 Alerts</button>
            <button class="btn btn-tertiary" onclick="InventoryPage.reset()">♻️ Restore</button>
            <button class="btn btn-primary" onclick="InventoryPage.add()">+ Add</button>
          </div>
        </div>
        <div id="inv-alerts" style="margin-bottom:16px"></div>
        <div class="tbl-wrap">
          <div class="tbl-hd"><span class="tbl-title">Medical Supplies</span></div>
          <div id="inv-list"></div>
        </div>`;

      this.renderTable(inv);
    } catch (e) {
      console.error('Inventory error:', e);
      document.getElementById('page-inventory').innerHTML = `<div style="padding:20px;color:red">Error: ${e.message}</div>`;
    }
  },

  renderTable(inv) {
    if (!inv || inv.length === 0) {
      document.getElementById('inv-list').innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3)">No items. Click <strong>+ Add</strong> or <strong>♻️ Restore</strong></div>';
      return;
    }

    const rows = inv.map(i => `
      <tr>
        <td><strong>${i.name || 'Unknown'}</strong></td>
        <td><span class="tmut">${i.category || '—'}</span></td>
        <td>${i.quantity || 0}</td>
        <td class="tmut">${i.unit || 'pcs'}</td>
        <td class="tmut">${i.supplier || '—'}</td>
        <td>${i.status || 'In Stock'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="InventoryPage.edit(${i.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="InventoryPage.delete(${i.id})">🗑</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('inv-list').innerHTML = `
      <table>
        <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Unit</th><th>Supplier</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  add() {
    const name = prompt('Item name:');
    if (!name) return;
    const qty = prompt('Quantity:', '10');
    if (!qty) return;

    let inv = DB.load('inventory') || [];
    if (!Array.isArray(inv)) inv = [];
    
    inv.push({
      id: DB.nextId('inventory'),
      name,
      quantity: parseInt(qty) || 0,
      category: 'Supplies',
      unit: 'pcs',
      supplier: '',
      status: 'In Stock',
      reorder_at: 10,
      auto_reorder_alert: false,
    });
    
    DB.save('inventory', inv);
    Utils.toast('Item added');
    this.render();
    Router.updateBadges();
  },

  edit(id) {
    let inv = DB.load('inventory') || [];
    const item = inv.find(x => x.id === id);
    if (!item) return;

    const name = prompt('Item name:', item.name);
    if (!name) return;
    const qty = prompt('Quantity:', item.quantity);
    if (!qty) return;

    item.name = name;
    item.quantity = parseInt(qty) || 0;
    DB.save('inventory', inv);
    Utils.toast('Item updated');
    this.render();
    Router.updateBadges();
  },

  delete(id) {
    if (!confirm('Delete this item?')) return;
    let inv = DB.load('inventory') || [];
    inv = inv.filter(x => x.id !== id);
    DB.save('inventory', inv);
    Utils.toast('Item deleted');
    this.render();
    Router.updateBadges();
  },

  reset() {
    if (!confirm('Restore default inventory?')) return;
    DB.save('inventory', SEED.inventory);
    Utils.toast('Inventory restored');
    this.render();
    Router.updateBadges();
  },

  runMLAlerts() {
    try {
      let inv = DB.load('inventory') || [];
      const low = inv.filter(i => (i.quantity || 0) < (i.reorder_at || 10));

      const alertEl = document.getElementById('inv-alerts');
      if (!alertEl) return;

      if (low.length === 0) {
        alertEl.innerHTML = '<div style="background:rgba(34,211,163,.1);border:1px solid rgba(34,211,163,.3);border-radius:8px;padding:12px;color:var(--green)">✅ All stock levels healthy</div>';
      } else {
        const items = low.map(i => `<strong>${i.name}</strong> (${i.quantity}/${i.reorder_at})`).join(', ');
        alertEl.innerHTML = `<div style="background:rgba(240,64,96,.1);border:1px solid rgba(240,64,96,.3);border-radius:8px;padding:12px;color:var(--red)">⚠️ Reorder: ${items}</div>`;
        
        // Add to notification center
        low.forEach(i => Notif.add(`📦 Stock Alert: ${i.name} is low (${i.quantity} remaining).`, 'warn'));
      }

      Utils.toast(`${low.length} item(s) need reordering`);
    } catch (e) {
      console.error('ML alerts error:', e);
    }
  }
};
