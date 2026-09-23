/**
 * OmniChat Visitor Widget - API Client
 */

import { WidgetConfig } from '../core/WidgetConfig';
import { StorageManager } from '../storage/StorageManager';

export class WidgetApi {
  public static async fetchMessages(limit = 50): Promise<any[]> {
    const convId = StorageManager.getConversationId();
    const res = await fetch(`${WidgetConfig.endpoint}/api.php?action=get_messages&conversation_id=${encodeURIComponent(convId)}&limit=${limit}`);
    const data = await res.json();
    return data.status === 'success' ? data.messages : [];
  }

  public static async sendMessage(params: {
    text: string;
    clientMessageId: string;
    fileAttachment?: any;
    senderName?: string;
  }): Promise<any> {
    const convId = StorageManager.getConversationId();
    const visitorId = StorageManager.getVisitorId();

    const payload = {
      conversation_id: convId,
      visitor_id: visitorId,
      client_message_id: params.clientMessageId,
      sender: 'visitor',
      sender_name: params.senderName || 'کاربر مهمان',
      text: params.text,
      file_attachment: params.fileAttachment || null
    };

    const res = await fetch(`${WidgetConfig.endpoint}/api.php?action=send_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to send message');
    }
    return data.message;
  }

  public static async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${WidgetConfig.endpoint}/api.php?action=upload_file`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Upload failed');
    }
    return data.file;
  }

  public static async sendTyping() {
    const convId = StorageManager.getConversationId();
    try {
      await fetch(`${WidgetConfig.endpoint}/api.php?action=set_typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: convId,
          sender: 'visitor',
          sender_name: 'کاربر مهمان'
        })
      });
    } catch (e) {
      // Ignore
    }
  }

  public static async pingVisitor(currentPage: string) {
    const visitorId = StorageManager.getVisitorId();
    try {
      await fetch(`${WidgetConfig.endpoint}/api.php?action=visitor_ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          name: 'کاربر مهمان',
          current_page: currentPage
        })
      });
    } catch (e) {
      // Ignore
    }
  }
}
