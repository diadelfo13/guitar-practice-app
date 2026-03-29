// Shared AudioContext singleton
let _ctx = null;

export function getAudioContext() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ── METRONOME ─────────────────────────────────────────────────────────────────
// Uses look-ahead scheduler pattern for drift-free timing

export class MetronomeEngine {
  constructor() {
    this.bpm = 80;
    this.subdivision = 1; // 1=quarter, 2=eighth, 4=sixteenth
    this.isPlaying = false;
    this.nextNoteTime = 0;
    this.beatCount = 0;
    this.lookahead = 25;         // ms between scheduler calls
    this.scheduleAhead = 0.1;   // seconds to schedule ahead
    this._timerId = null;
    this._beatCallbacks = [];
    this._tapTimes = [];
  }

  onBeat(cb) { this._beatCallbacks.push(cb); }
  offBeat(cb) { this._beatCallbacks = this._beatCallbacks.filter(f => f !== cb); }

  _scheduleClick(time, isAccent) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = isAccent ? 1200 : 900;
    gain.gain.setValueAtTime(isAccent ? 0.5 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.start(time);
    osc.stop(time + 0.05);

    // Notify UI for visual beat flash
    const delay = Math.max(0, (time - ctx.currentTime) * 1000);
    setTimeout(() => {
      this._beatCallbacks.forEach(cb => cb(isAccent, this.beatCount));
    }, delay);
  }

  _scheduler() {
    const ctx = getAudioContext();
    const secPerBeat = 60 / this.bpm;
    const secPerTick = secPerBeat / this.subdivision;

    while (this.nextNoteTime < ctx.currentTime + this.scheduleAhead) {
      const isAccent = this.beatCount % (4 * this.subdivision) === 0;
      this._scheduleClick(this.nextNoteTime, isAccent);
      this.nextNoteTime += secPerTick;
      this.beatCount++;
    }
    this._timerId = setTimeout(() => this._scheduler(), this.lookahead);
  }

  start() {
    if (this.isPlaying) return;
    const ctx = getAudioContext();
    this.isPlaying = true;
    this.beatCount = 0;
    this.nextNoteTime = ctx.currentTime + 0.1;
    this._scheduler();
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this._timerId);
    this._timerId = null;
  }

  toggle() {
    this.isPlaying ? this.stop() : this.start();
  }

  setBpm(bpm) { this.bpm = Math.max(20, Math.min(300, bpm)); }

  tap() {
    const now = Date.now();
    const times = this._tapTimes;
    if (times.length > 0 && now - times[times.length - 1] > 3000) {
      this._tapTimes = [];
    }
    this._tapTimes.push(now);
    if (this._tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < this._tapTimes.length; i++) {
        intervals.push(this._tapTimes[i] - this._tapTimes[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avg);
      this.setBpm(newBpm);
      // Restart if playing to sync to new tempo
      if (this.isPlaying) { this.stop(); this.start(); }
      return Math.max(20, Math.min(300, newBpm));
    }
    return this.bpm;
  }
}

// ── DRONE ENGINE ──────────────────────────────────────────────────────────────

export class DroneEngine {
  constructor() {
    this.isPlaying = false;
    this._nodes = [];
    this._masterGain = null;
    this._volume = 0.3;
    this.waveform = 'sawtooth';
    this._lastFreqs = [];
  }

  _ensureMaster() {
    if (!this._masterGain) {
      const ctx = getAudioContext();
      this._masterGain = ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(ctx.destination);
    }
  }

  // freqs: array of frequencies to drone (e.g. [130.81, 196.00] for C + G)
  start(freqs) {
    this._lastFreqs = freqs;
    this.stop();
    this._ensureMaster();
    const ctx = getAudioContext();

    this._nodes = freqs.flatMap(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.6 / freqs.length;
      osc.type = this.waveform;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start();

      // Sub-octave for warmth
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      subGain.gain.value = 0.25 / freqs.length;
      sub.type = 'sine';
      sub.frequency.value = freq / 2;
      sub.connect(subGain);
      subGain.connect(this._masterGain);
      sub.start();

      return [{ osc, gain }, { osc: sub, gain: subGain }];
    });

    this.isPlaying = true;
  }

  stop() {
    this._nodes.forEach(({ osc }) => { try { osc.stop(); } catch (_) {} });
    this._nodes = [];
    this.isPlaying = false;
  }

  toggle(freqs) {
    this.isPlaying ? this.stop() : this.start(freqs);
  }

  setVolume(v) {
    this._volume = v;
    if (this._masterGain) this._masterGain.gain.value = v;
  }

  setWaveform(w) {
    this.waveform = w;
  }

  toggleWithLastFreqs() {
    if (this.isPlaying) {
      this.stop();
    } else if (this._lastFreqs.length > 0) {
      this.start(this._lastFreqs);
    }
  }
}

// ── PLAY NOTE ──────────────────────────────────────────────────────────────────
// Play a short sine tone at the given MIDI note number

export function playNote(midiNumber, duration = 0.5) {
  const ctx = getAudioContext();
  const freq = 440 * Math.pow(2, (midiNumber - 69) / 12);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

// Singletons
export const metronome = new MetronomeEngine();
export const drone = new DroneEngine();
