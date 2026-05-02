/* ═══════════════════════════════════════════════════════════
   heart-bg.js — Anatomical sketch heart background
   ═══════════════════════════════════════════════════════════ */

const HeartBG = {
  init() {
    if (document.getElementById('heart-bg')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'heart-bg';
    wrapper.innerHTML = `
      <div class="heart-blob heart-large">${HeartBG._heartSVG()}</div>
    `;

    document.body.insertBefore(wrapper, document.body.firstChild);
    this.large = wrapper.querySelector('.heart-large');
    this.startTime = performance.now();
    this._animate();
  },

  _heartSVG() {
    return `
      <svg viewBox="0 0 600 720" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heartBase" x1="0%" y1="10%" x2="100%" y2="90%">
            <stop offset="0%" stop-color="#ff4d6d" />
            <stop offset="45%" stop-color="#db1b35" />
            <stop offset="100%" stop-color="#7a0b1e" />
          </linearGradient>
          <radialGradient id="heartGlow" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stop-color="rgba(255, 90, 120, .36)" />
            <stop offset="100%" stop-color="rgba(255, 90, 120, 0)" />
          </radialGradient>
          <linearGradient id="heartLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,.4)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <path class="heart-shape" fill="url(#heartBase)" d="M300 40c-90 0-140 70-170 130-30 63-20 118 15 165 28 38 70 66 120 87 30 12 58 26 68 42 10-16 41-30 68-42 50-21 92-49 120-87 35-47 45-102 15-165-30-60-80-130-170-130z" />
        <path fill="rgba(12,10,16,.82)" d="M125 175c15-35 50-63 90-70 37-6 72 0 103 18 26-16 61-22 92-18 42 5 77 28 93 70 11 29 8 62-6 92-18 37-49 68-85 92-27 17-58 29-79 46-9 7-17 14-20 22-3 9 5 24 12 29 17 13 38 8 57 7 27-3 52-10 77-19 40-15 74-38 95-70 20-30 23-58 12-90-16-42-52-75-97-91-24-8-49-12-74-12-28 0-57 4-83 17-28 14-48 33-62 57-12 22-14 45-8 68 3 10 7 19 13 27 10 15 23 25 38 33 15 8 33 14 52 16 17 2 32 2 48 0 22-4 53-19 64-35 12-20 11-48-5-66-17-19-53-30-80-35-24-5-49-4-73 3-18 5-36 14-48 26z" />
        <path fill="none" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" d="M180 120c20-16 52-22 84-18 24 3 44 12 62 26" />
        <path fill="none" stroke="rgba(255,255,255,.22)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M390 120c-20-16-52-22-84-18-24 3-44 12-62 26" />
        <ellipse cx="300" cy="170" rx="210" ry="220" fill="url(#heartGlow)" opacity=".72" />
        <path fill="none" stroke="rgba(255,255,255,.25)" stroke-width="12" d="M235 280c32 8 58 18 84 18 18 0 40-3 60-10" />
        <path fill="none" stroke="rgba(255,255,255,.16)" stroke-width="8" d="M250 360c26 6 50 12 76 10" />
      </svg>
    `;
  },

  _animate() {
    const time = (performance.now() - this.startTime) / 1000;
    const scale = 1 + Math.sin(time * 2.1) * 0.045;
    const drift = Math.sin(time * 0.85) * 12;

    if (this.large) {
      this.large.style.transform = `translate(-50%, -50%) scale(${scale}) translateY(${drift}px)`;
    }

    requestAnimationFrame(() => HeartBG._animate());
  }
};
