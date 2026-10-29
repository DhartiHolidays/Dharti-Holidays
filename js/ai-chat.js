/* =========================================================
   AI CHAT WIDGET ("Dharti AI")
   Floating chat bubble + panel injected into every public page.
   - formats replies (bold, bullet lists, clickable links and phone numbers)
   - quick-start buttons, conversation kept while browsing between pages
   - friendly errors with WhatsApp / phone fallbacks
   ========================================================= */

(function () {
  const WA = 'https://wa.me/919824044070';
  const STORE = 'dhartiAiChat';
  const QUICK = [
    ['Holiday packages', "I'm looking for a holiday package. Can you suggest some options?"],
    ['Hotels', 'I need help finding a hotel.'],
    ['Visa help', 'I need help with a visa.'],
    ['Car rental', 'I need a car for a trip. What are my options?'],
    ['Flights', 'I want to enquire about flights.'],
  ];

  const widgetHtml = `
    <div class="ai-greeting-bubble" id="aiGreetingBubble">
      <button class="greeting-close" id="aiGreetingClose" aria-label="Dismiss">✕</button>
      <span class="greeting-label">Dharti AI</span>
      <p>👋 Planning a trip? Ask me about packages, hotels, visas &amp; car rentals — instantly.</p>
    </div>
    <button class="ai-chat-toggle" id="aiChatToggle" aria-label="Chat with Dharti AI">
      💬
      <span class="ai-chat-badge">AI</span>
    </button>
    <div class="ai-chat-panel" id="aiChatPanel">
      <div class="ai-chat-head">
        <div class="ai-chat-head-brand">
          <img src="images/logo-96.webp" alt="Dharti Holidays">
          <div><strong>Ask Dharti AI</strong><span>PACKAGES · HOTELS · VISA · CARS</span></div>
        </div>
        <button class="ai-chat-close" id="aiChatClose" aria-label="Close">✕</button>
      </div>
      <div class="ai-chat-messages" id="aiChatMessages"></div>
      <div class="ai-chat-input-row">
        <input type="text" id="aiChatInput" maxlength="500" placeholder="Type your question..." autocomplete="off">
        <button class="ai-chat-send-btn" id="aiChatSendBtn" aria-label="Send">➤</button>
      </div>
      <div class="ai-chat-foot">Prefer a person? <a href="tel:+919374615071">Call</a> or <a href="${WA}" target="_blank" rel="noopener noreferrer">WhatsApp</a> us. AI answers can miss details — our team confirms final prices.</div>
    </div>`;

  const escapeHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function linkLabel(url) {
    const map = [['package.html', 'View package →'], ['destination.html', 'View destination guide →'], ['hotels.html', 'Browse hotels →'], ['vehicle.html', 'View vehicle →'], ['car-transfer.html', 'Car transfer →'], ['visa.html', 'Visa services →'], ['passport.html', 'Passport services →'], ['flights.html', 'Flights enquiry →'], ['packages.html', 'All packages →'], ['destinations.html', 'All destinations →'], ['blog.html', 'Travel blog →'], ['post.html', 'Read article →']];
    for (const m of map) if (url.indexOf(m[0]) !== -1) return m[1];
    return url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40);
  }
  function inline(raw) {
    let s = escapeHtml(raw);
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)'"])/g, (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${linkLabel(u)}</a>`);
    s = s.replace(/(\+91[\s-]?\d{5}[\s-]?\d{5})/g, (p) => `<a href="tel:+91${p.replace(/\D/g, '').slice(-10)}">${p}</a>`);
    return s;
  }
  // Blank line = new paragraph, lines starting "- " / "* " / "• " / "1. " = bullet list
  function formatReply(text) {
    const lines = String(text == null ? '' : text).replace(/\r/g, '').split('\n');
    let out = '', para = [], list = [];
    const flushP = () => { if (para.length) { out += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; } };
    const flushL = () => { if (list.length) { out += '<ul>' + list.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul>'; list = []; } };
    lines.forEach(raw => {
      const l = raw.trim();
      if (!l) { flushP(); flushL(); return; }
      const m = l.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) { flushP(); list.push(m[1]); } else { flushL(); para.push(l); }
    });
    flushP(); flushL();
    return out;
  }
  window.__dhartiAiFormat = formatReply; // handy for testing

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', widgetHtml);
    initAiChatWidget();
  });

  function initAiChatWidget() {
    const toggle = document.getElementById('aiChatToggle');
    const panel = document.getElementById('aiChatPanel');
    const closeBtn = document.getElementById('aiChatClose');
    const messagesEl = document.getElementById('aiChatMessages');
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSendBtn');
    const greetingBubble = document.getElementById('aiGreetingBubble');
    const greetingClose = document.getElementById('aiGreetingClose');

    // ---- conversation memory: survives page changes within this browser tab ----
    let state = { sid: Math.random().toString(36).slice(2, 12), history: [], messages: [] };
    try { const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); if (saved && saved.sid) state = saved; } catch (e) { /* ignore */ }
    const save = () => { try { state.messages = state.messages.slice(-40); sessionStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ } };
    const debug = /[?&]aidebug/.test(location.search);
    let opened = false, busy = false, lastText = '';

    function hideGreeting() { greetingBubble.classList.remove('show'); }
    if (!sessionStorage.getItem('aiGreetingShown') && !state.messages.length) {
      setTimeout(() => { if (!opened) greetingBubble.classList.add('show'); }, 2500);
      sessionStorage.setItem('aiGreetingShown', 'true');
    }
    greetingBubble.addEventListener('click', (e) => { if (e.target === greetingClose) return; hideGreeting(); openChat(); });
    greetingClose.addEventListener('click', (e) => { e.stopPropagation(); hideGreeting(); });

    function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }
    function addMessage(role, text, persist) {
      const div = document.createElement('div');
      div.className = `ai-msg ${role}`;
      if (role === 'assistant') div.innerHTML = formatReply(text); else div.textContent = text;
      messagesEl.appendChild(div); scrollDown();
      if (persist) { state.messages.push({ role, text }); save(); }
      return div;
    }
    function addNote(html) { const d = document.createElement('div'); d.className = 'ai-msg system-note'; d.innerHTML = html; messagesEl.appendChild(d); scrollDown(); return d; }
    function removeChips() { const c = messagesEl.querySelector('.ai-chips'); if (c) c.remove(); }
    function addChips() {
      const wrap = document.createElement('div'); wrap.className = 'ai-chips';
      QUICK.forEach(q => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ai-chip'; b.textContent = q[0]; b.addEventListener('click', () => sendMessage(q[1])); wrap.appendChild(b); });
      messagesEl.appendChild(wrap); scrollDown();
    }

    function openChat() {
      panel.classList.add('open'); toggle.classList.add('pulse-stopped');
      if (!opened) {
        opened = true;
        if (state.messages.length) { state.messages.forEach(m => addMessage(m.role, m.text, false)); }
        else {
          addMessage('assistant', "Hi! I'm Dharti AI. I can help with **holiday packages, hotels, visas, passports and car rentals** — check itineraries and prices, compare options, or answer travel questions. What are you planning?", true);
          addChips();
        }
      }
      setTimeout(() => input.focus(), 150);
    }
    toggle.addEventListener('click', () => { hideGreeting(); panel.classList.contains('open') ? panel.classList.remove('open') : openChat(); });
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    const waLink = `<a href="${WA}" target="_blank" rel="noopener noreferrer" style="color:var(--gold); font-weight:700;">WhatsApp</a>`;
    async function sendMessage(forced) {
      const text = String(forced != null ? forced : input.value).trim();
      if (!text || busy) return;
      removeChips();
      addMessage('user', text, true);
      input.value = ''; lastText = text;

      if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
        addNote(`The assistant isn't connected yet — please ${waLink} us.`);
        return;
      }
      busy = true; sendBtn.disabled = true;
      const typingEl = addMessage('assistant', 'Typing...', false); typingEl.classList.add('typing');
      const slow = setTimeout(() => { typingEl.textContent = 'Checking our latest details...'; }, 5000);
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 55000);

      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctrl.signal,
          body: JSON.stringify({ action: 'chatWithAgent', message: text, history: state.history, sessionId: state.sid }),
        });
        const result = await res.json();
        typingEl.remove();
        if (result.error === 'not_configured') {
          addNote(`The assistant isn't connected yet — please ${waLink} us.`);
        } else if (result.error === 'daily_limit_reached') {
          addNote(`We've reached today's chat limit. Please ${waLink} us or call <a href="tel:+919374615071" style="color:var(--gold); font-weight:700;">+91 93746 15071</a> and we'll help right away.`);
        } else if (result.error) {
          const n = addNote(`Sorry, I couldn't answer that just now. <a href="#" data-retry style="color:var(--gold); font-weight:700;">Try again</a> or reach us on ${waLink}.` + (debug && result.detail ? `<br><span style="font-family:monospace; font-size:10.5px; opacity:0.8;">${escapeHtml(result.detail)}</span>` : ''));
          const r = n.querySelector('[data-retry]'); if (r) r.addEventListener('click', (e) => { e.preventDefault(); n.remove(); sendMessage(lastText); });
        } else {
          addMessage('assistant', result.reply, true);
          state.history = result.history || state.history; save();
        }
      } catch (err) {
        typingEl.remove();
        const n = addNote(`I couldn't reach the server — please check your connection. <a href="#" data-retry style="color:var(--gold); font-weight:700;">Try again</a> or ${waLink} us.`);
        const r = n.querySelector('[data-retry]'); if (r) r.addEventListener('click', (e) => { e.preventDefault(); n.remove(); sendMessage(lastText); });
        console.error(err);
      } finally {
        clearTimeout(slow); clearTimeout(timer); busy = false; sendBtn.disabled = false; input.focus();
      }
    }
    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
  }
})();


// Close the "Call Now" number menu when clicking elsewhere or pressing Escape
document.addEventListener('click', function (e) {
  document.querySelectorAll('details.call-menu[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') document.querySelectorAll('details.call-menu[open]').forEach(function (d) { d.removeAttribute('open'); });
});
