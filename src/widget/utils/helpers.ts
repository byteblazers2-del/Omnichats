/**
 * OmniChat Visitor Widget - Helpers & Sanitization
 */

export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function formatTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function linkify(text: string): string {
  const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#007AFF;text-decoration:underline;">$1</a>');
}

export function generateUUID(): string {
  return 'id_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
