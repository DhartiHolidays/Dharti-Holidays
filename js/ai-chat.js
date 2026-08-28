/* =========================================================
   AI CHAT WIDGET
   Injects a floating chat bubble + panel into any page that
   loads this file. Talks to the chatWithAgent backend action.
   Falls back gracefully with a WhatsApp link if the agent
   isn't configured yet or hits its daily safety cap.
   ========================================================= */

(function () {
  const widgetHtml = `
    <button class="ai-chat-toggle" id="aiChatToggle" aria-label="Chat with Dharti AI">💬</button>
    <div class="ai-chat-panel" id="aiChatPanel">
      <div class="ai-chat-head">
        <div class="ai-chat-head-brand">
          <img src="images/logo.jpg" alt="Dharti Holidays">
          <div><strong>Ask Dharti AI</strong><span>DESTINATIONS · PACKAGES · HOTELS</span></div>
        </div>
        <button class="ai-chat-close" id="aiChatClose" aria-label="Close">✕</button>
      </div>
      <div class="ai-chat-messages" id="aiChatMessages"></div>
      <div class="ai-chat-input-row">
        <input type="text" id="aiChatInput" placeholder="Ask about a destination, hotel, or package...">
        <button class="ai-chat-send-btn" id="aiChatSendBtn" aria-label="Send">➤</button>
      </div>
    </div>`;

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

    let history = [];
    let opened = false;

    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (!opened) {
        opened = true;
        addMessage('assistant', "Hi! I'm Dharti Holidays' AI assistant. Ask me about destinations, packages, hotels, or visa/passport services — I'm happy to help.");
      }
    });
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    function addMessage(role, text) {
      const div = document.createElement('div');
      div.className = `ai-msg ${role}`;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function addSystemNote(text) {
      const div = document.createElement('div');
      div.className = 'ai-msg system-note';
      div.innerHTML = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
        addMessage('user', text);
        addSystemNote('The AI assistant isn\'t set up yet — <a href="https://wa.me/919824044070" target="_blank" style="color:var(--gold); font-weight:700;">chat with us on WhatsApp</a> instead.');
        input.value = '';
        return;
      }

      addMessage('user', text);
      input.value = '';
      sendBtn.disabled = true;
      const typingEl = addMessage('assistant', 'Typing...');
      typingEl.classList.add('typing');

      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'chatWithAgent', message: text, history }),
        });
        const result = await res.json();
        typingEl.remove();

        if (result.error === 'not_configured') {
          addSystemNote('The AI assistant isn\'t set up yet — <a href="https://wa.me/919824044070" target="_blank" style="color:var(--gold); font-weight:700;">chat with us on WhatsApp</a> instead.');
        } else if (result.error === 'daily_limit_reached') {
          addSystemNote('We\'ve hit today\'s chat limit — please <a href="https://wa.me/919824044070" target="_blank" style="color:var(--gold); font-weight:700;">continue on WhatsApp</a>, our team will help right away.');
        } else if (result.error) {
          addSystemNote('Something went wrong — please try again or <a href="https://wa.me/919824044070" target="_blank" style="color:var(--gold); font-weight:700;">reach us on WhatsApp</a>.');
        } else {
          addMessage('assistant', result.reply);
          history = result.history || history;
        }
      } catch (err) {
        typingEl.remove();
        addSystemNote('Could not reach the assistant — please check your connection or <a href="https://wa.me/919824044070" target="_blank" style="color:var(--gold); font-weight:700;">message us on WhatsApp</a>.');
        console.error(err);
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
})();
