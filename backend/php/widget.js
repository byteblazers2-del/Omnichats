(function() {
  // OmniChat Standalone Production Embeddable Widget
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const serverUrl = scriptTag ? scriptTag.src.replace('/widget.js', '') : window.location.origin;

  let visitorToken = localStorage.getItem('omni_vtoken') || '';
  let activeConversation = null;
  let isOpen = false;

  // Create Container
  const container = document.createElement('div');
  container.id = 'omnichat-widget-root';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.left = '20px'; // RTL Friendly placement
  container.style.zIndex = '999999';
  container.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  document.body.appendChild(container);

  // Floating Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:white">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  triggerBtn.style.width = '58px';
  triggerBtn.style.height = '58px';
  triggerBtn.style.borderRadius = '50%';
  triggerBtn.style.background = 'linear-gradient(135deg, #007AFF 0%, #0A84FF 100%)';
  triggerBtn.style.boxShadow = '0 6px 20px rgba(0, 122, 255, 0.4)';
  triggerBtn.style.border = 'none';
  triggerBtn.style.cursor = 'pointer';
  triggerBtn.style.display = 'flex';
  triggerBtn.style.alignItems = 'center';
  triggerBtn.style.justifyContent = 'center';
  triggerBtn.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
  
  triggerBtn.onmouseenter = () => triggerBtn.style.transform = 'scale(1.08)';
  triggerBtn.onmouseleave = () => triggerBtn.style.transform = 'scale(1)';
  triggerBtn.onclick = toggleChatWindow;
  container.appendChild(triggerBtn);

  // Chat Popup Window
  const chatWindow = document.createElement('div');
  chatWindow.style.position = 'absolute';
  chatWindow.style.bottom = '70px';
  chatWindow.style.left = '0';
  chatWindow.style.width = '360px';
  chatWindow.style.height = '520px';
  chatWindow.style.maxHeight = 'calc(100vh - 100px)';
  chatWindow.style.backgroundColor = '#ffffff';
  chatWindow.style.borderRadius = '20px';
  chatWindow.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
  chatWindow.style.border = '1px solid #e2e8f0';
  chatWindow.style.display = 'none';
  chatWindow.style.flexDirection = 'column';
  chatWindow.style.overflow = 'hidden';
  chatWindow.style.direction = 'rtl';
  chatWindow.innerHTML = `
    <div style="background: linear-gradient(135deg, #007AFF 0%, #0A84FF 100%); color: white; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: bold; font-size: 14px;">پشتیبانی آنلاین</div>
        <div style="font-size: 11px; opacity: 0.9;">پاسخگوی سوالات شما هستیم</div>
      </div>
      <button id="omni-close-btn" style="background:none; border:none; color:white; font-size:18px; cursor:pointer;">&times;</button>
    </div>
    <div id="omni-messages-box" style="flex: 1; padding: 14px; overflow-y: auto; background: #f8fafc; font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
      <div style="background: #e2e8f0; padding: 8px 12px; border-radius: 12px; align-self: flex-start; max-width: 80%;">
        سلام! چطور می‌تونم کمکتون کنم؟
      </div>
    </div>
    <div style="padding: 10px 14px; background: white; border-top: 1px solid #edf2f7; display: flex; gap: 8px;">
      <input id="omni-input" type="text" placeholder="پیام خود را بنویسید..." style="flex:1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; font-size: 12px; font-family: inherit;">
      <button id="omni-send-btn" style="background: #007AFF; color: white; border: none; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-size: 12px; font-weight: bold;">ارسال</button>
    </div>
  `;
  container.appendChild(chatWindow);

  document.getElementById('omni-close-btn').onclick = toggleChatWindow;

  function toggleChatWindow() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    if (isOpen && !activeConversation) {
      initVisitor();
    }
  }

  function initVisitor() {
    fetch(`${serverUrl}/api.php?action=visitor_init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_token: visitorToken,
        current_page: window.location.href
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        visitorToken = data.visitor_token;
        localStorage.setItem('omni_vtoken', visitorToken);
        activeConversation = data.conversation;
        pollMessages();
      }
    })
    .catch(console.error);
  }

  function appendMessage(text, isMe) {
    const box = document.getElementById('omni-messages-box');
    const msg = document.createElement('div');
    msg.style.padding = '8px 12px';
    msg.style.borderRadius = '12px';
    msg.style.maxWidth = '80%';
    msg.style.lineHeight = '1.4';
    if (isMe) {
      msg.style.background = '#007AFF';
      msg.style.color = 'white';
      msg.style.alignSelf = 'flex-end';
    } else {
      msg.style.background = '#e2e8f0';
      msg.style.color = '#1e293b';
      msg.style.alignSelf = 'flex-start';
    }
    msg.textContent = text;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  function sendMessage() {
    const input = document.getElementById('omni-input');
    const text = input.value.trim();
    if (!text || !activeConversation) return;

    appendMessage(text, true);
    input.value = '';

    fetch(`${serverUrl}/api.php?action=send_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: activeConversation.id,
        sender_type: 'visitor',
        sender_name: 'کاربر مهمان',
        message_text: text
      })
    }).catch(console.error);
  }

  document.getElementById('omni-send-btn').onclick = sendMessage;
  document.getElementById('omni-input').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  let lastMsgId = 0;
  function pollMessages() {
    if (!activeConversation) return;
    fetch(`${serverUrl}/api.php?action=get_messages&conversation_id=${activeConversation.id}&after_id=${lastMsgId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.messages.length > 0) {
          data.messages.forEach(m => {
            if (m.sender_type !== 'visitor') {
              appendMessage(m.message_text, false);
            }
            lastMsgId = Math.max(lastMsgId, m.id);
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isOpen) setTimeout(pollMessages, 3000);
      });
  }
})();
