/**
 * OmniChat Visitor Widget - Core Config & Event Bus
 */

export interface WidgetOptions {
  endpoint?: string;
  themeColor?: string;
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  position?: 'bottom-left' | 'bottom-right';
  autoOpen?: boolean;
}

export class WidgetConfig {
  public static endpoint = '.';
  public static themeColor = '#007AFF';
  public static title = 'پشتیبانی آنلاین';
  public static subtitle = 'پاسخگویی سریع کارشناسان';
  public static welcomeMessage = 'سلام! وقتتون بخیر. چطور می‌تونیم کمکتون کنیم؟';
  public static position: 'bottom-left' | 'bottom-right' = 'bottom-left';

  public static init(options?: WidgetOptions) {
    if (!options) return;
    if (options.endpoint) this.endpoint = options.endpoint.replace(/\/$/, '');
    if (options.themeColor) this.themeColor = options.themeColor;
    if (options.title) this.title = options.title;
    if (options.subtitle) this.subtitle = options.subtitle;
    if (options.welcomeMessage) this.welcomeMessage = options.welcomeMessage;
    if (options.position) this.position = options.position;
  }
}

type EventCallback = (...args: any[]) => void;

export class EventBus {
  private static events: { [key: string]: EventCallback[] } = {};

  public static on(event: string, callback: EventCallback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  public static emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((cb) => cb(...args));
    }
  }

  public static off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }
}
