/**
 * OmniChat Standalone Visitor Widget - Main Entry Point
 */

import { WidgetConfig, WidgetOptions, EventBus } from './core/WidgetConfig';
import { ChatManager } from './chat/ChatManager';
import { SSEClient } from './realtime/SSEClient';
import { WidgetUI } from './ui/WidgetUI';

export class OmniChatWidget {
  private static instance: OmniChatWidget | null = null;
  private chatManager: ChatManager;
  private sseClient: SSEClient;
  private ui: WidgetUI;

  constructor(options?: WidgetOptions) {
    WidgetConfig.init(options);
    this.chatManager = new ChatManager();
    this.sseClient = new SSEClient();
    this.ui = new WidgetUI(this.chatManager, this.sseClient);
  }

  public static init(options?: WidgetOptions): OmniChatWidget {
    if (!this.instance) {
      this.instance = new OmniChatWidget(options);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.instance?.ui.render();
        });
      } else {
        this.instance.ui.render();
      }
    }
    return this.instance;
  }

  public static on(event: string, callback: (...args: any[]) => void) {
    EventBus.on(event, callback);
  }

  public static off(event: string, callback: (...args: any[]) => void) {
    EventBus.off(event, callback);
  }
}

// Global exposure for script tag inclusion
if (typeof window !== 'undefined') {
  (window as any).OmniChat = OmniChatWidget;

  // Auto-init if data attributes or inline options exist
  const currentScript = document.currentScript;
  if (currentScript) {
    const autoInit = currentScript.getAttribute('data-auto-init');
    const endpoint = currentScript.getAttribute('data-endpoint') || '.';
    const themeColor = currentScript.getAttribute('data-theme-color') || '#007AFF';

    if (autoInit !== 'false') {
      OmniChatWidget.init({
        endpoint,
        themeColor
      });
    }
  }
}

export default OmniChatWidget;
