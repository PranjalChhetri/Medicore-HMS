/* ═══════════════════════════════════════════════════════════
   app.js — Main application bootstrap
   Initialises DB, Router, and exposes HMS global for backwards
   compatibility (toast / modal shortcuts).
   ═══════════════════════════════════════════════════════════ */

// Convenience shortcuts so onclick="HMS.toast(...)" still works
const HMS = {
  toast:      (...args) => Utils.toast(...args),
  openModal:  (...args) => Utils.openModal(...args),
  closeModal: ()        => Utils.closeModal(),
};

document.addEventListener('DOMContentLoaded', () => {
  DB.init();          // seed localStorage on first load
  Router.init();      // bind nav + render first page
  Router.updateBadges();
  HeartBG.init();     // initialize beating heart background
});
