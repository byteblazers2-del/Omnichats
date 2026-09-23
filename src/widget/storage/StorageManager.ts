/**
 * OmniChat Visitor Widget - Local Storage & Offline Queue
 */

import { generateUUID } from '../utils/helpers';

export interface PendingMessage {
  clientMessageId: string;
  text: string;
  fileAttachment?: any;
  timestamp: string;
}

export class StorageManager {
  private static VISITOR_KEY = 'omnichat_visitor_id';
  private static CONV_KEY = 'omnichat_conv_id';
  private static PENDING_QUEUE_KEY = 'omnichat_pending_msgs';
  private static DRAFT_KEY = 'omnichat_draft_text';

  public static getVisitorId(): string {
    let vid = localStorage.getItem(this.VISITOR_KEY);
    if (!vid) {
      vid = 'vis_' + generateUUID();
      localStorage.setItem(this.VISITOR_KEY, vid);
    }
    return vid;
  }

  public static getConversationId(): string {
    let cid = localStorage.getItem(this.CONV_KEY);
    if (!cid) {
      const vid = this.getVisitorId();
      cid = 'conv_' + vid.substring(4, 12) + '_' + Math.random().toString(36).substring(2, 6);
      localStorage.setItem(this.CONV_KEY, cid);
    }
    return cid;
  }

  public static getPendingMessages(): PendingMessage[] {
    const raw = localStorage.getItem(this.PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  public static addPendingMessage(msg: PendingMessage) {
    const queue = this.getPendingMessages();
    queue.push(msg);
    localStorage.setItem(this.PENDING_QUEUE_KEY, JSON.stringify(queue));
  }

  public static removePendingMessage(clientMessageId: string) {
    const queue = this.getPendingMessages().filter((m) => m.clientMessageId !== clientMessageId);
    localStorage.setItem(this.PENDING_QUEUE_KEY, JSON.stringify(queue));
  }

  public static saveDraft(text: string) {
    localStorage.setItem(this.DRAFT_KEY, text);
  }

  public static getDraft(): string {
    return localStorage.getItem(this.DRAFT_KEY) || '';
  }
}
