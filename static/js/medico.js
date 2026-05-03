/* ═══════════════════════════════════════════════════════════
   medico.js — Smart Care Concierge Chatbot
   ═══════════════════════════════════════════════════════════ */

const Medico = {
  isOpen: false,
  history: [],

  init() {
    console.log("Medico Smart Concierge Initializing...");
    this.render();
    // Welcome message after 2 seconds
    setTimeout(() => {
      this.addMessage('Medico', "Hello! I'm Medico, your Smart Hospital Concierge. How can I assist you today?");
    }, 2000);
  },

  render() {
    const html = `
      <div id="medico-container" class="medico-container">
        <div id="medico-window" class="medico-window" style="display:none">
          <div class="medico-hd">
            <div class="fac gap8">
              <div class="medico-avatar-small">M</div>
              <div>
                <div style="font-weight:700; font-size:14px;">Medico</div>
                <div style="font-size:10px; opacity:0.8;">Smart Concierge</div>
              </div>
            </div>
            <button class="medico-close" onclick="Medico.toggle()">×</button>
          </div>
          <div id="medico-messages" class="medico-messages"></div>
          <div class="medico-ft">
            <input type="text" id="medico-input" placeholder="Type a message..." onkeypress="if(event.key==='Enter') Medico.send()">
            <button onclick="Medico.send()">➤</button>
          </div>
        </div>
        <button id="medico-trigger" class="medico-trigger" onclick="Medico.toggle()">
          <span class="medico-icon">💬</span>
          <span class="medico-label">Chat with Medico</span>
        </button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  toggle() {
    const win = document.getElementById('medico-window');
    this.isOpen = !this.isOpen;
    win.style.display = this.isOpen ? 'flex' : 'none';
    if (this.isOpen) {
      document.getElementById('medico-input').focus();
    }
  },

  async send() {
    const input = document.getElementById('medico-input');
    const msg = input.value.trim();
    if (!msg) return;

    this.addMessage('User', msg);
    input.value = '';

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    this.addMessage('Medico', '...', typingId);

    try {
      const resp = await fetch(`${API.BASE}/nlp/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: this.history })
      });

      if (!resp.ok) throw new Error('System error');
      const data = await resp.json();
      
      // Remove typing indicator and add response
      document.getElementById(typingId).remove();
      this.addMessage('Medico', data.response);
      
      // Keep track of history
      this.history.push({ user: msg, medico: data.response });
      if (this.history.length > 5) this.history.shift(); // Keep last 5 exchanges

    } catch (err) {
      document.getElementById(typingId).innerHTML = `<span style="color:var(--red)">Connection lost. Please try again later.</span>`;
    }
  },

  addMessage(sender, text, id = null) {
    const box = document.getElementById('medico-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `medico-msg ${sender === 'User' ? 'msg-user' : 'msg-medico'}`;
    if (id) msgDiv.id = id;
    
    msgDiv.innerHTML = `
      <div class="msg-content">
        ${text}
      </div>
      <div class="msg-meta">${sender} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
  }
};

// Initialize Medico
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Medico.init());
} else {
    Medico.init();
}
