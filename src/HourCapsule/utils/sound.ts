// Tiny WebAudio synthesis — no asset, no preload. Single AudioContext
// lazily created on first call (so we don't unlock audio on mount).
//
// Used for the like-button pop. Wrap every call in try/catch — Safari
// can refuse to create AudioContext outside a user gesture; failures
// are silent.

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) {
    const Klass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _ctx = new Klass();
  }
  return _ctx;
}

/** Quick rising sine "thunk" — satisfying like-button pop. ~200ms. */
export function playLike() {
  try {
    const a = ctx();
    const t0 = a.currentTime;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(840, t0);
    osc.frequency.exponentialRampToValueAtTime(1380, t0 + 0.065);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  } catch {
    /* no-op */
  }
}

/** Soft descending unlike — half-volume of playLike, lower register. */
export function playUnlike() {
  try {
    const a = ctx();
    const t0 = a.currentTime;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(640, t0);
    osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.08);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.1, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + 0.18);
  } catch {
    /* no-op */
  }
}

/** Best-effort vibrate — iOS Safari ignores, Android responds. */
export function hapticTap() {
  try {
    if ('vibrate' in navigator) navigator.vibrate(10);
  } catch {
    /* no-op */
  }
}
