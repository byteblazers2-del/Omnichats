/**
 * OmniChat Visitor Widget - UI Renderer & DOM Controller
 */

import { WidgetConfig, EventBus } from '../core/WidgetConfig';
import { ChatManager } from '../chat/ChatManager';
import { SSEClient } from '../realtime/SSEClient';
import { StorageManager } from '../storage/StorageManager';
import { escapeHtml, linkify, formatTime } from '../utils/helpers';
import { WidgetApi } from '../api/WidgetApi';

export class WidgetUI {
  private chatManager: ChatManager;
  private sseClient: SSEClient;
  private isOpen = false;
  private rootContainer: HTMLElement | null = null;
  private messageListEl: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;
  private typingIndicatorEl: HTMLElement | null = null;
  private unreadBadgeEl: HTMLElement | null = null;
  private unreadCount = 0;

  constructor(chatManager: ChatManager, sseClient: SSEClient) {
    this.chatManager = chatManager;
    this.sseClient = sseClient;
    this.initEvents();
  }

  public render() {
    if (document.getElementById('omnichat-widget-root')) return;

    this.rootContainer = document.createElement('div');
    this.rootContainer.id = 'omnichat-widget-root';
    this.rootContainer.innerHTML = this.getTemplateHTML();
    document.body.appendChild(this.rootContainer);

    this.bindDOM();
    this.chatManager.loadInitialHistory().then((msgs) => {
      this.renderMessages(msgs);
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.id) this.sseClient.setLastId(lastMsg.id);
      }
    });

    this.sseClient.connect();
    WidgetApi.pingVisitor(window.location.pathname);
  }

  private initEvents() {
    EventBus.on('chat:message', (msg) => {
      this.appendMessageToDOM(msg);
      if (!this.isOpen && msg.sender === 'operator') {
        this.unreadCount++;
        this.updateBadge();
      }
      this.scrollToBottom();
    });

    EventBus.on('chat:message_confirmed', (msg) => {
      this.updateConfirmedMessage(msg);
    });

    EventBus.on('chat:typing', (data) => {
      if (this.typingIndicatorEl) {
        if (data.isTyping) {
          this.typingIndicatorEl.textContent = `${data.senderName || 'پشتیبان'} در حال نوشتن...`;
          this.typingIndicatorEl.style.display = 'block';
        } else {
          this.typingIndicatorEl.style.display = 'none';
        }
      }
    });

    // Offline & Reconnect listeners
    window.addEventListener('online', () => {
      this.sseClient.connect();
      this.chatManager.flushPendingQueue();
    });
  }

  private getTemplateHTML(): string {
    const isLeft = WidgetConfig.position === 'bottom-left';
    const posClass = isLeft ? 'left: 24px;' : 'right: 24px;';

    return `
      <style>
        #omnichat-widget-root {
          font-family: -apple-system, BlinkMacSystemFont, "Vazirmatn", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          direction: rtl;
          z-index: 999999;
          position: fixed;
          bottom: 24px;
          ${posClass}
        }
        .omni-launcher-btn {
          width: 58px;
          height: 58px;
          border-radius: 29px;
          background: ${WidgetConfig.themeColor};
          color: #fff;
          border: none;
          box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
          position: relative;
        }
        .omni-launcher-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 12px 28px rgba(0, 122, 255, 0.45);
        }
        .omni-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff3b30;
          color: white;
          font-size: 11px;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #fff;
        }
        .omni-window {
          position: absolute;
          bottom: 74px;
          ${isLeft ? 'left: 0;' : 'right: 0;'}
          width: 380px;
          height: 560px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 100px);
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0,0,0,0.06);
          display: none;
          flex-direction: column;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.2s;
          transform-origin: bottom ${isLeft ? 'left' : 'right'};
        }
        .omni-window.open {
          display: flex;
          animation: omniPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes omniPop {
          0% { opacity: 0; transform: scale(0.92) translateY(16px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .omni-header {
          background: ${WidgetConfig.themeColor};
          color: #ffffff;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
        }
        .omni-header-info h4 { margin: 0; font-size: 15px; font-weight: 700; }
        .omni-header-info p { margin: 2px 0 0; font-size: 11px; opacity: 0.85; }
        .omni-close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .omni-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .omni-msg-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
          position: relative;
        }
        .omni-msg-bubble.visitor {
          align-self: flex-start;
          background: ${WidgetConfig.themeColor};
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }
        .omni-msg-bubble.operator {
          align-self: flex-end;
          background: #ffffff;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04);
        }
        .omni-msg-time {
          font-size: 10px;
          opacity: 0.7;
          margin-top: 4px;
          text-align: left;
          direction: ltr;
        }
        .omni-typing-bar {
          font-size: 11px;
          color: #64748b;
          padding: 4px 16px;
          background: #f8fafc;
          display: none;
        }
        .omni-input-bar {
          padding: 12px 14px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .omni-input-bar textarea {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
          resize: none;
          height: 38px;
          max-height: 90px;
          font-family: inherit;
        }
        .omni-input-bar textarea:focus {
          border-color: ${WidgetConfig.themeColor};
        }
        .omni-send-btn, .omni-attach-btn {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .omni-send-btn {
          background: ${WidgetConfig.themeColor};
          color: #ffffff;
        }
        .omni-attach-btn {
          background: #f1f5f9;
          color: #64748b;
        }
      </style>

      <div class="omni-window" id="omnichat-window">
        <div class="omni-header">
          <div class="omni-header-info">
            <h4>${escapeHtml(WidgetConfig.title)}</h4>
            <p>${escapeHtml(WidgetConfig.subtitle)}</p>
          </div>
          <button type="button" class="omni-close-btn" id="omnichat-close-btn">✕</button>
        </div>

        <div class="omni-messages" id="omnichat-msg-list">
          <div class="omni-msg-bubble operator">
            ${escapeHtml(WidgetConfig.welcomeMessage)}
            <div class="omni-msg-time">${formatTime()}</div>
          </div>
        </div>

        <div class="omni-typing-bar" id="omnichat-typing"></div>

        <div class="omni-input-bar">
          <input type="file" id="omnichat-file-input" style="display:none;" />
          <button type="button" class="omni-attach-btn" id="omnichat-attach-btn" title="ارسال فایل">📎</button>
          <textarea id="omnichat-textarea" placeholder="پیام خود را بنویسید..." rows="1"></textarea>
          <button type="button" class="omni-send-btn" id="omnichat-send-btn" title="ارسال">➤</button>
        </div>
      </div>

      <button type="button" class="omni-launcher-btn" id="omnichat-launcher-btn">
        <span id="omnichat-icon-open">💬</span>
        <div class="omni-badge" id="omnichat-unread-badge">0</div>
      </button>
    `;
  }

  private bindDOM() {
    const launcher = document.getElementById('omnichat-launcher-btn');
    const closeBtn = document.getElementById('omnichat-close-btn');
    const sendBtn = document.getElementById('omnichat-send-btn');
    const attachBtn = document.getElementById('omnichat-attach-btn');
    const fileInput = document.getElementById('omnichat-file-input') as HTMLInputElement;

    this.messageListEl = document.getElementById('omnichat-msg-list');
    this.inputEl = document.getElementById('omnichat-textarea') as HTMLTextAreaElement;
    this.typingIndicatorEl = document.getElementById('omnichat-typing');
    this.unreadBadgeEl = document.getElementById('omnichat-unread-badge');

    launcher?.addEventListener('click', () => this.toggleWindow());
    closeBtn?.addEventListener('click', () => this.closeWindow());

    sendBtn?.addEventListener('click', () => this.handleSendMessage());

    this.inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      } else {
        this.chatManager.handleUserTyping();
      }
    });

    this.inputEl?.addEventListener('input', () => {
      if (this.inputEl) {
        StorageManager.saveDraft(this.inputEl.value);
      }
    });

    // Restore draft
    const draft = StorageManager.getDraft();
    if (draft && this.inputEl) {
      this.inputEl.value = draft;
    }

    attachBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        this.chatManager.sendFileMessage(fileInput.files[0]);
        fileInput.value = '';
      }
    });
  }

  private toggleWindow() {
    if (this.isOpen) {
      this.closeWindow();
    } else {
      this.openWindow();
    }
  }

  private openWindow() {
    const win = document.getElementById('omnichat-window');
    win?.classList.add('open');
    this.isOpen = true;
    this.unreadCount = 0;
    this.updateBadge();
    this.scrollToBottom();
    setTimeout(() => this.inputEl?.focus(), 150);
  }

  private closeWindow() {
    const win = document.getElementById('omnichat-window');
    win?.classList.remove('open');
    this.isOpen = false;
  }

  private updateBadge() {
    if (!this.unreadBadgeEl) return;
    if (this.unreadCount > 0) {
      this.unreadBadgeEl.textContent = this.unreadCount.toString();
      this.unreadBadgeEl.style.display = 'flex';
    } else {
      this.unreadBadgeEl.style.display = 'none';
    }
  }

  private handleSendMessage() {
    if (!this.inputEl) return;
    const text = this.inputEl.value.trim();
    if (!text) return;

    this.inputEl.value = '';
    StorageManager.saveDraft('');
    this.chatManager.sendTextMessage(text);
  }

  private renderMessages(messages: any[]) {
    if (!this.messageListEl) return;
    this.messageListEl.innerHTML = '';

    // Welcome bubble
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'omni-msg-bubble operator';
    welcomeDiv.innerHTML = `${escapeHtml(WidgetConfig.welcomeMessage)}<div class="omni-msg-time">${formatTime()}</div>`;
    this.messageListEl.appendChild(welcomeDiv);

    messages.forEach((msg) => this.appendMessageToDOM(msg));
    this.scrollToBottom();
  }

  private appendMessageToDOM(msg: any) {
    if (!this.messageListEl) return;

    const div = document.createElement('div');
    div.className = `omni-msg-bubble ${msg.sender === 'visitor' ? 'visitor' : 'operator'}`;
    if (msg.clientMessageId) {
      div.setAttribute('data-client-id', msg.clientMessageId);
    }

    let bodyHtml = linkify(escapeHtml(msg.text || ''));

    if (msg.fileAttachment) {
      if (msg.fileAttachment.type === 'image') {
        bodyHtml += `<br><img src="${escapeHtml(msg.fileAttachment.url)}" style="max-width:100%; border-radius:10px; margin-top:6px;" />`;
      } else {
        bodyHtml += `<br><a href="${escapeHtml(msg.fileAttachment.url)}" target="_blank" download style="color:inherit; font-weight:bold; text-decoration:underline;">📥 دانلود فایل (${escapeHtml(msg.fileAttachment.size || '')})</a>`;
      }
    }

    div.innerHTML = `${bodyHtml}<div class="omni-msg-time">${escapeHtml(msg.timestamp || formatTime(msg.createdAt))}</div>`;
    this.messageListEl.appendChild(div);
  }

  private updateConfirmedMessage(msg: any) {
    if (!this.messageListEl || !msg.clientMessageId) return;
    const existing = this.messageListEl.querySelector(`[data-client-id="${msg.clientMessageId}"]`);
    if (existing) {
      existing.removeAttribute('data-client-id');
    }
  }

  private scrollToBottom() {
    if (this.messageListEl) {
      this.messageListEl.scrollTop = this.messageListEl.scrollHeight;
    }
  }
}
