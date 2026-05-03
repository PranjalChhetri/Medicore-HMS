/* ═══════════════════════════════════════════════════════════
   pages/translator.js — Multilingual AI Medical Translator
   ═══════════════════════════════════════════════════════════ */

const TranslatorPage = {
   render() {
      const el = document.getElementById('page-translator');
      el.innerHTML = `
      <div class="page-hd" style="margin-bottom: 20px;">
        <div>
          <h2>🌍 AI Medical Translator</h2>
          <div class="meta">Break language barriers in critical care</div>
        </div>
      </div>
      
      <div style="background:var(--bg); padding:16px; border-radius:10px; border:1px solid var(--border); box-shadow:0 4px 12px rgba(0,0,0,0.05); margin-bottom:20px;">
         <p style="font-size:13px; color:var(--text2); margin:0;">
            <strong>How it works:</strong> Type or paste exactly what the patient says, even if it's in a foreign language (Spanish, Hindi, French, etc.) or informal slang. The system will instantly act as a medical interpreter and translate it into precise, formal English medical terminology for the clinical chart.
         </p>
      </div>

      <div class="card" style="display:flex; flex-direction:column; gap:16px;">
         <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
               <label class="flbl" style="margin:0;">Patient's Raw Input (Any Language)</label>
               <button class="btn btn-sm" id="btn-mic" onclick="TranslatorPage.startDictation()" style="background:var(--blue); color:white; border-radius:50px; padding:6px 12px; display:flex; align-items:center; gap:6px;">
                  🎙️ Start Listening
               </button>
            </div>
            <textarea id="translator-input" class="input" style="width:100%; height:100px; resize:vertical; font-size:14px; padding:12px;" placeholder="e.g. Me duele mucho el pecho y el dolor me baja por el brazo izquierdo..."></textarea>
         </div>
         
         <button class="btn btn-primary" onclick="TranslatorPage.translate()" id="btn-translate" style="align-self:flex-start; padding:10px 20px;">
            🌍 Translate to Medical English
         </button>
         
         <div id="translator-result-container" style="display:none; margin-top:10px;">
            <label class="flbl" style="color:var(--green)">Formal Clinical Translation (Ready for Chart)</label>
            <div id="translator-result" style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); padding:16px; border-radius:8px; font-size:15px; color:var(--text); line-height:1.5;">
            </div>
         </div>
      </div>
    `;
   },

   mediaRecorder: null,
   audioChunks: [],
   audioBase64: null,

   async startDictation() {
      const micBtn = document.getElementById('btn-mic');
      const inputEl = document.getElementById('translator-input');
      const resCont = document.getElementById('translator-result-container');
      const resEl = document.getElementById('translator-result');

      // If already recording, stop it.
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
         this.mediaRecorder.stop();
         return;
      }

      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         this.mediaRecorder = new MediaRecorder(stream);
         this.audioChunks = [];

         this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
               this.audioChunks.push(event.data);
            }
         };

         this.mediaRecorder.onstart = () => {
            micBtn.innerHTML = '🛑 Stop Recording';
            micBtn.style.background = 'var(--red)';
            inputEl.value = '';
            inputEl.placeholder = '🔴 Recording audio... Speak now...';
            this.audioBase64 = null;
         };

         this.mediaRecorder.onstop = () => {
            micBtn.innerHTML = '🎙️ Record Audio';
            micBtn.style.background = 'var(--blue)';
            inputEl.placeholder = 'Audio captured! Click Translate to process...';

            // Convert chunks to a single Blob, then to Base64
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
               // Format is "data:audio/webm;base64,....."
               const base64data = reader.result;
               this.audioBase64 = base64data.split(',')[1]; // Keep just the Base64 part
               inputEl.value = '[Audio Recording Captured - Ready to Translate]';
               Utils.toast('Audio captured successfully!', 's');

               // Stop the microphone tracks to free up the hardware
               stream.getTracks().forEach(track => track.stop());
            };
         };

         this.mediaRecorder.start();
      } catch (err) {
         Utils.toast('Could not access microphone: ' + err.message, 'e');
      }
   },

   async translate() {
      const inputEl = document.getElementById('translator-input');
      const btnEl = document.getElementById('btn-translate');
      const resCont = document.getElementById('translator-result-container');
      const resEl = document.getElementById('translator-result');

      const text = inputEl.value.trim();
      if (!text && !this.audioBase64) return;

      btnEl.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></div> Translating clinical data...';
      btnEl.disabled = true;

      try {
         const payload = { text: text };
         if (this.audioBase64) {
            payload.audio_base64 = this.audioBase64;
         }

         const resp = await fetch(`${API.BASE}/nlp/translate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (!resp.ok) throw new Error('API Error');
         const res = await resp.json();

         resEl.innerHTML = `<strong>${res.translation}</strong>`;
         resCont.style.display = 'block';
      } catch (err) {
         resEl.innerHTML = `<span style="color:var(--red)">❌ Translation failed: ${err.message}</span>`;
         resCont.style.display = 'block';
      } finally {
         btnEl.innerHTML = '🌍 Translate to Medical English';
         btnEl.disabled = false;
         this.audioBase64 = null; // Reset audio after translating
      }
   }
};
