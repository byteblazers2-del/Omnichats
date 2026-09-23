/**
 * OmniChat Visitor Widget - Chat Manager & Queue Processor
 */

import { WidgetApi } from '../api/WidgetApi';
import { StorageManager, PendingMessage } from '../storage/StorageManager';
import { EventBus } from '../core/WidgetConfig';
import { generateUUID } from '../utils/helpers';
import { SoundManager } from '../notifications/SoundManager';

export class ChatManager {
  private messages: any[] = [];
  private knownIds = new Set<number>();
  private knownClientIds = new Set<string>();
  private isProcessingQueue = false;
  private typingTimeout: any = null;

  public async loadInitialHistory(): Promise<any[]> {
    try {
      const msgs = await WidgetApi.fetchMessages(40);
      msgs.forEach((m) => this.registerMessage(m));
      return this.messages;
    } catch (e) {
      return [];
    }
  }

  public registerMessage(msg: any): boolean {
    if (msg.id && this.knownIds.has(msg.id)) {
      return false; // Already present
    }
    if (msg.clientMessageId && this.knownClientIds.has(msg.clientMessageId)) {
      // Update the optimistic message with server id
      const idx = this.messages.findIndex((m) => m.clientMessageId === msg.clientMessageId);
      if (idx !== -1) {
        this.messages[idx] = msg;
        if (msg.id) this.knownIds.add(msg.id);
        StorageManager.removePendingMessage(msg.clientMessageId);
        return true;
      }
    }

    if (msg.id) this.knownIds.add(msg.id);
    if (msg.clientMessageId) this.knownClientIds.add(msg.clientMessageId);
    this.messages.push(msg);

    // If operator sent message, play sound and flash title
    if (msg.sender === 'operator') {
      SoundManager.playMessageSound();
      SoundManager.flashTitle(msg.text);
    }

    return true;
  }

  public async sendTextMessage(text: string): Promise<any> {
    const clientMessageId = generateUUID();
    const optimisticMsg = {
      clientMessageId,
      sender: 'visitor',
      senderName: 'شما',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPending: true
    };

    this.registerMessage(optimisticMsg);
    EventBus.emit('chat:message', optimisticMsg);

    // Save to offline queue
    StorageManager.addPendingMessage({
      clientMessageId,
      text,
      timestamp: optimisticMsg.timestamp
    });

    try {
      const serverMsg = await WidgetApi.sendMessage({
        text,
        clientMessageId
      });
      this.registerMessage(serverMsg);
      EventBus.emit('chat:message_confirmed', serverMsg);
      return serverMsg;
    } catch (err) {
      console.warn('Network issue; message remains queued for retry', err);
      return optimisticMsg;
    }
  }

  public async sendFileMessage(file: File): Promise<any> {
    const clientMessageId = generateUUID();
    try {
      const uploadedFile = await WidgetApi.uploadFile(file);
      const serverMsg = await WidgetApi.sendMessage({
        text: `📎 فایل پیوست: ${uploadedFile.name}`,
        clientMessageId,
        fileAttachment: uploadedFile
      });
      this.registerMessage(serverMsg);
      EventBus.emit('chat:message', serverMsg);
      return serverMsg;
    } catch (err: any) {
      alert('خطا در ارسال فایل: ' + (err.message || 'مشکل در آپلود'));
    }
  }

  public handleUserTyping() {
    if (this.typingTimeout) return;
    WidgetApi.sendTyping();
    this.typingTimeout = setTimeout(() => {
      this.typingTimeout = null;
    }, 3000);
  }

  public async flushPendingQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    const queue = StorageManager.getPendingMessages();
    for (const item of queue) {
      try {
        const res = await WidgetApi.sendMessage({
          text: item.text,
          clientMessageId: item.clientMessageId,
          fileAttachment: item.fileAttachment
        });
        this.registerMessage(res);
        EventBus.emit('chat:message_confirmed', res);
      } catch (e) {
        break; // Network still unavailable
      }
    }

    this.isProcessingQueue = false;
  }
}
