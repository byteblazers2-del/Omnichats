/**
 * OmniChat Visitor Widget - Audio Chimes & Tab Notifications
 */

export class SoundManager {
  private static audioCtx: AudioContext | null = null;
  private static originalTitle = document.title;
  private static titleInterval: any = null;

  public static playMessageSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {
      // Ignore autoplay policy restrictions
    }
  }

  public static flashTitle(newMsgText: string) {
    if (document.hasFocus()) return;
    if (this.titleInterval) clearInterval(this.titleInterval);

    let flag = false;
    this.titleInterval = setInterval(() => {
      document.title = flag ? `(۱ پیام جدید) ${this.originalTitle}` : this.originalTitle;
      flag = !flag;
    }, 1000);

    const onFocus = () => {
      clearInterval(this.titleInterval);
      document.title = this.originalTitle;
      window.removeEventListener('focus', onFocus);
    };
    window.addEventListener('focus', onFocus);
  }
}
