/**
 * OmniChat API Client for React Dashboard & Widget
 * Handles authentication headers, token storage, REST calls and Realtime long-polling
 */

import { Conversation, Operator, Department, OfflineLead, ChatMessage } from '../types';

const TOKEN_KEY = 'omnichat_session_token';
const SAVED_OP_KEY = 'omnichat_auth_operator';

export class ApiClient {
  private static baseUrl = './api.php';

  public static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public static setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public static clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SAVED_OP_KEY);
  }

  public static getSavedOperator(): Operator | null {
    const raw = localStorage.getItem(SAVED_OP_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  public static setSavedOperator(op: Operator) {
    localStorage.setItem(SAVED_OP_KEY, JSON.stringify(op));
  }

  private static async request<T>(action: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    const separator = this.baseUrl.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${separator}action=${action}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Server responded with ${res.status}`);
      }
      return data;
    } catch (err: any) {
      console.warn(`API [${action}] failed, falling back to local state`, err);
      throw err;
    }
  }

  // 1. Auth APIs
  public static async login(email: string, password: string): Promise<{ token: string; operator: Operator }> {
    const res = await this.request<{ status: string; token: string; operator: Operator }>('login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    this.setSavedOperator(res.operator);
    return res;
  }

  public static async logout(): Promise<void> {
    try {
      await this.request('logout', { method: 'POST' });
    } finally {
      this.clearAuth();
    }
  }

  public static async getMe(): Promise<Operator> {
    const res = await this.request<{ status: string; operator: Operator }>('get_me');
    this.setSavedOperator(res.operator);
    return res.operator;
  }

  public static async updateMyStatus(status: 'online' | 'busy' | 'away' | 'offline'): Promise<void> {
    await this.request('update_my_status', {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  // 2. Conversations & Messages
  public static async getConversations(): Promise<Conversation[]> {
    const res = await this.request<{ status: string; conversations: Conversation[] }>('get_conversations');
    return res.conversations || [];
  }

  public static async sendMessage(params: {
    conversationId: string;
    text: string;
    sender: 'visitor' | 'operator';
    senderName?: string;
    fileAttachment?: any;
    visitorId?: string;
    departmentId?: string;
    visitorEmail?: string;
  }): Promise<ChatMessage> {
    const res = await this.request<{ status: string; message: ChatMessage }>('send_message', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: params.conversationId,
        text: params.text,
        sender: params.sender,
        sender_name: params.senderName,
        file_attachment: params.fileAttachment,
        visitor_id: params.visitorId,
        department_id: params.departmentId,
        visitor_email: params.visitorEmail
      })
    });
    return res.message;
  }

  public static async markRead(conversationId: string): Promise<void> {
    await this.request('mark_read', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId })
    });
  }

  public static async editMessage(messageId: string, text: string): Promise<void> {
    await this.request('edit_message', {
      method: 'POST',
      body: JSON.stringify({ message_id: messageId, text })
    });
  }

  public static async deleteMessage(messageId: string): Promise<void> {
    await this.request('delete_message', {
      method: 'POST',
      body: JSON.stringify({ message_id: messageId })
    });
  }

  public static async deleteConversation(conversationId: string): Promise<void> {
    await this.request('delete_conversation', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId })
    });
  }

  public static async toggleBlock(conversationId: string, isBlocked: boolean, reason?: string): Promise<void> {
    await this.request('toggle_block', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, is_blocked: isBlocked ? 1 : 0, reason })
    });
  }

  public static async updateConversationMeta(conversationId: string, meta: {
    tags?: string[];
    internal_notes?: string[];
    department_id?: string;
    operator_id?: string;
  }): Promise<void> {
    await this.request('update_conversation_meta', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, ...meta })
    });
  }

  // 3. File Upload
  public static async uploadFile(file: File): Promise<{ name: string; size: string; type: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const separator = this.baseUrl.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${separator}action=upload_file`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'File upload failed');
    }
    return data.file;
  }

  // 4. Operators & Departments
  public static async getOperators(): Promise<Operator[]> {
    const res = await this.request<{ status: string; operators: Operator[] }>('get_operators');
    return res.operators || [];
  }

  public static async saveOperator(operator: Partial<Operator> & { password?: string }): Promise<string> {
    const res = await this.request<{ status: string; operator_id: string }>('save_operator', {
      method: 'POST',
      body: JSON.stringify(operator)
    });
    return res.operator_id;
  }

  public static async deleteOperator(id: string): Promise<void> {
    await this.request('delete_operator', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  }

  public static async getDepartments(): Promise<Department[]> {
    const res = await this.request<{ status: string; departments: Department[] }>('get_departments');
    return res.departments || [];
  }

  public static async saveDepartment(dept: Partial<Department>): Promise<string> {
    const res = await this.request<{ status: string; department_id: string }>('save_department', {
      method: 'POST',
      body: JSON.stringify(dept)
    });
    return res.department_id;
  }

  public static async deleteDepartment(id: string): Promise<void> {
    await this.request('delete_department', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  }

  // 5. Offline Leads
  public static async getLeads(): Promise<OfflineLead[]> {
    const res = await this.request<{ status: string; leads: OfflineLead[] }>('get_leads');
    return res.leads || [];
  }

  public static async submitOfflineLead(lead: {
    name: string;
    email: string;
    phone?: string;
    deptId?: string;
    message: string;
  }): Promise<string> {
    const res = await this.request<{ status: string; lead_id: string }>('submit_offline_lead', {
      method: 'POST',
      body: JSON.stringify(lead)
    });
    return res.lead_id;
  }

  public static async deleteLead(id: string): Promise<void> {
    await this.request('delete_lead', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  }
}
