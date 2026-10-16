/**
 * Procedural Web Audio API sound synthesizer
 * Zero external audio files, completely reliable and instant
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  public init() {
    this.initCtx();
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playCatchPositive(points: number = 20) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Base pitch depends on points
    const baseFreq = points >= 50 ? 659.25 : points >= 40 ? 587.33 : points >= 30 ? 523.25 : 440; // E5, D5, C5, A4

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);

    // Add a sparkle overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.18);
    gain2.gain.setValueAtTime(0.12, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.26);
  }

  public playCatchNegative() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playMilestone() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  public playBirthdayFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Happy birthday melody notes & durations
    // C4 C4 D4 C4 F4 E4 | C4 C4 D4 C4 G4 F4
    const melody = [
      { f: 261.63, d: 0.25 },
      { f: 261.63, d: 0.25 },
      { f: 293.66, d: 0.4 },
      { f: 261.63, d: 0.4 },
      { f: 349.23, d: 0.4 },
      { f: 329.63, d: 0.7 },

      { f: 261.63, d: 0.25 },
      { f: 261.63, d: 0.25 },
      { f: 293.66, d: 0.4 },
      { f: 261.63, d: 0.4 },
      { f: 392.00, d: 0.4 },
      { f: 349.23, d: 0.7 },

      { f: 261.63, d: 0.25 },
      { f: 261.63, d: 0.25 },
      { f: 523.25, d: 0.4 },
      { f: 440.00, d: 0.4 },
      { f: 349.23, d: 0.4 },
      { f: 329.63, d: 0.4 },
      { f: 293.66, d: 0.7 },

      { f: 466.16, d: 0.25 },
      { f: 466.16, d: 0.25 },
      { f: 440.00, d: 0.4 },
      { f: 349.23, d: 0.4 },
      { f: 392.00, d: 0.4 },
      { f: 349.23, d: 0.9 },
    ];

    let t = this.ctx.currentTime + 0.1;
    melody.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + n.d + 0.05);

      t += n.d * 1.05;
    });
  }
}

export const soundManager = new SoundManager();
