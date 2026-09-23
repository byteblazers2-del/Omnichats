/**
 * OmniChat Visitor Widget - Realtime SSE Client with Auto-Reconnect & Heartbeat
 */

import { WidgetConfig, EventBus } from '../core/WidgetConfig';
import { StorageManager } from '../storage/StorageManager';
import { WidgetApi } from '../api/WidgetApi';

export class SSEClient {
  private eventSource: EventSource | null = null;
  private lastEventId = 0;
  private retryAttempts = 0;
  private maxRetryAttempts = 10;
  private reconnectTimer: any = null;
  private pollInterval: any = null;
  private isConnected = false;

  public connect() {
    this.disconnect();

    const convId = StorageManager.getConversationId();
    const streamUrl = `${WidgetConfig.endpoint}/stream.php?conversation_id=${encodeURIComponent(convId)}&last_id=${this.lastEventId}&role=visitor`;

    if (typeof EventSource !== 'undefined') {
      try {
        this.eventSource = new EventSource(streamUrl);

        this.eventSource.onopen = () => {
          this.isConnected = true;
          this.retryAttempts = 0;
          EventBus.emit('realtime:connected');
          this.stopPollingFallback();
        };

        this.eventSource.addEventListener('message', (e: MessageEvent) => {
          if (e.lastEventId) {
            this.lastEventId = parseInt(e.lastEventId, 10);
          }
          try {
            const msg = JSON.parse(e.data);
            if (msg.id && msg.id > this.lastEventId) {
              this.lastEventId = msg.id;
            }
            EventBus.emit('chat:message', msg);
          } catch (err) {
            console.warn('Invalid SSE message data', err);
          }
        });

        this.eventSource.addEventListener('typing', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            EventBus.emit('chat:typing', data);
          } catch (err) {
            // Ignore
          }
        });

        this.eventSource.onerror = () => {
          this.isConnected = false;
          EventBus.emit('realtime:disconnected');
          this.handleReconnect();
        };
      } catch (err) {
        this.startPollingFallback();
      }
    } else {
      this.startPollingFallback();
    }
  }

  private handleReconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.retryAttempts < this.maxRetryAttempts) {
      this.retryAttempts++;
      const delay = Math.min(30000, 1000 * Math.pow(1.5, this.retryAttempts));
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      // Switch to long-poll fallback
      this.startPollingFallback();
    }
  }

  private startPollingFallback() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      try {
        const convId = StorageManager.getConversationId();
        const res = await fetch(`${WidgetConfig.endpoint}/api.php?action=poll_messages&conversation_id=${encodeURIComponent(convId)}&last_id=${this.lastEventId}`);
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            if (msg.id > this.lastEventId) {
              this.lastEventId = msg.id;
              EventBus.emit('chat:message', msg);
            }
          });
        }
      } catch (e) {
        // Ignore
      }
    }, 4000);
  }

  private stopPollingFallback() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  public setLastId(id: number) {
    if (id > this.lastEventId) {
      this.lastEventId = id;
    }
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPollingFallback();
    this.isConnected = false;
  }
}
