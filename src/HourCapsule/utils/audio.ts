// WebAudio for Album Cover Generator.
//
// Aesthetic: a near-silent indie record-shop in the rain.
//   - Ambient: very faint vinyl crackle that breathes in and out, plus a
//     warm low pad that wells up once every 12-24s and fades to silence.
//   - Press: a soft record-needle-drop click.
//   - Reveal: a sustained shoegaze-style pad chord.
//
// Init only on first pointerdown (Aigram preloads games; mount-time audio
// leaks into the previous game). startAmbient() is idempotent.

let ctx: AudioContext | null = null;
let ambientStarted = false;
let ambientStopRequested = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const C = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    } catch {
      return null;
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ---------- One-shots ----------

export function playNeedleDrop(): void {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;

  // 80ms-long broad-band click, low-passed and slightly resonant — the
  // pop of a needle landing on the lead-in groove.
  const bufSize = Math.floor(ac.sampleRate * 0.12);
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    const t = i / bufSize;
    d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 28);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1800;
  lp.Q.value = 0.7;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.55, now);
  src.connect(lp).connect(g).connect(ac.destination);
  src.start(now);

  // Tiny low thump under the click.
  const o = ac.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(120, now);
  o.frequency.exponentialRampToValueAtTime(45, now + 0.16);
  const og = ac.createGain();
  og.gain.setValueAtTime(0.2, now);
  og.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  o.connect(og).connect(ac.destination);
  o.start(now);
  o.stop(now + 0.25);
}

export function playRevealChord(): void {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;

  // ── 1. Celebratory shimmer arpeggio at t=0 ──
  // Bright ascending bell-like sparkle over ~0.7s. Marks the moment
  // of "pressed!" Bell timbre = sine + slight triangle harmonic with
  // fast attack + ~400ms exponential decay. Notes climb an A-major
  // pentatonic ladder so it feels triumphant without being saccharine.
  //
  //  A4 → C#5 → E5 → A5 → C#6 → E6
  const sparkle = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
  const sparkleMaster = ac.createGain();
  sparkleMaster.gain.value = 0.32;
  const sparkleHp = ac.createBiquadFilter();
  sparkleHp.type = 'highpass';
  sparkleHp.frequency.value = 380;
  sparkleMaster.connect(sparkleHp).connect(ac.destination);

  sparkle.forEach((freq, i) => {
    const t = now + i * 0.085;
    // sine fundamental
    const oSine = ac.createOscillator();
    oSine.type = 'sine';
    oSine.frequency.value = freq;
    // triangle 2-octave harmonic for bell shimmer
    const oTri = ac.createOscillator();
    oTri.type = 'triangle';
    oTri.frequency.value = freq * 2;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    const gTri = ac.createGain();
    gTri.gain.value = 0.18;
    oSine.connect(g).connect(sparkleMaster);
    oTri.connect(gTri).connect(g);
    oSine.start(t);
    oSine.stop(t + 0.6);
    oTri.start(t);
    oTri.stop(t + 0.6);
  });

  // ── 2. Atmospheric Amaj7 pad swells in underneath ──
  // Root: A3 (220Hz). Voicing: A C# E G# (1 3 5 7).
  const notes = [220, 277.18, 329.63, 415.30];

  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.16, now + 2.4);
  master.gain.setValueAtTime(0.16, now + 4.5);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);
  // Soft low-pass to keep it warm.
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200;
  lp.Q.value = 0.7;
  master.connect(lp).connect(ac.destination);

  notes.forEach((freq, i) => {
    [-3, 0, 3].forEach((cents) => {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * Math.pow(2, cents / 1200);
      const g = ac.createGain();
      g.gain.value = (1 - i * 0.18) * 0.33;
      o.connect(g).connect(master);
      o.start(now + i * 0.18);
      o.stop(now + 8.7);
    });
  });
}

// Satisfying "pop" for tap feedback on reactions — short ascending
// blip + high triangle pluck for sparkle. Body comes from doubling
// two oscillators. Borrowed from pet-filter.
export function playPop(): void {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime;

  const o1 = ac.createOscillator();
  const g1 = ac.createGain();
  o1.type = 'sine';
  o1.frequency.setValueAtTime(440, t0);
  o1.frequency.exponentialRampToValueAtTime(880, t0 + 0.06);
  g1.gain.setValueAtTime(0, t0);
  g1.gain.linearRampToValueAtTime(0.10, t0 + 0.008);
  g1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
  o1.connect(g1).connect(ac.destination);
  o1.start(t0);
  o1.stop(t0 + 0.16);

  const o2 = ac.createOscillator();
  const g2 = ac.createGain();
  o2.type = 'triangle';
  o2.frequency.value = 2200;
  g2.gain.setValueAtTime(0, t0);
  g2.gain.linearRampToValueAtTime(0.04, t0 + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
  o2.connect(g2).connect(ac.destination);
  o2.start(t0);
  o2.stop(t0 + 0.10);
}

// Small haptic buzz on mobile — best-effort, ignored on desktop.
export function hapticTap(): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(8); } catch { /* no-op */ }
  }
}

// Install a single delegated pointerdown listener that fires playPop +
// hapticTap on every interactive control (button, role="button", anchor).
// Opt-out: add `data-no-feedback` on the element (or any ancestor) when
// it has its own bespoke audio (e.g. reactions, which run a custom
// burst sequence and would otherwise double-pop).
//
// Following the CLAUDE rule: this only installs the listener — it does
// NOT create the AudioContext at mount. The context is lazily created
// by playPop's getCtx() on the FIRST real user pointerdown.
let globalTapInstalled = false;
export function installGlobalTapFeedback(): void {
  if (globalTapInstalled) return;
  if (typeof window === 'undefined') return;
  globalTapInstalled = true;
  window.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest(
      'button, [role="button"], a[href]',
    ) as HTMLElement | null;
    if (!interactive) return;
    if ((interactive as HTMLButtonElement).disabled) return;
    if (interactive.closest('[data-no-feedback]')) return;
    playPop();
    hapticTap();
  }, true);
}

export function playClick(): void {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const o = ac.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(880, now);
  o.frequency.exponentialRampToValueAtTime(440, now + 0.08);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  o.connect(g).connect(ac.destination);
  o.start(now);
  o.stop(now + 0.2);
}

// ---------- Ambient: breathing vinyl crackle + occasional warm pad ----------

function makeCrackle(ac: AudioContext): { gain: GainNode; stop: () => void } {
  // Sparse impulse train through a band-pass — characteristic vinyl crackle.
  const bufSize = 4 * ac.sampleRate;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    // Random spikes ~12/sec on top of pink-ish hush.
    const hush = (Math.random() * 2 - 1) * 0.08;
    const spike = Math.random() < 0.0004 ? (Math.random() * 2 - 1) : 0;
    d[i] = hush + spike;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400;
  bp.Q.value = 0.7;
  const gain = ac.createGain();
  gain.gain.value = 0;
  src.connect(bp).connect(gain).connect(ac.destination);
  src.start();
  return {
    gain,
    stop: () => {
      try { src.stop(); } catch { /* already stopped */ }
    },
  };
}

function playWarmSwell(ac: AudioContext): void {
  const now = ac.currentTime;
  // Single low fifth — A2 + E3.
  const freqs = [110, 164.81];
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.04, now + 3.5);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 9);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 700;
  master.connect(lp).connect(ac.destination);
  freqs.forEach((freq, i) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = 1 - i * 0.3;
    o.connect(g).connect(master);
    o.start(now);
    o.stop(now + 9.2);
  });
}

async function ambientLoop(ac: AudioContext): Promise<void> {
  const crackle = makeCrackle(ac);
  let crackleRunning = true;

  // Breathing crackle envelope: rise / hold / fall / silence.
  (async () => {
    while (crackleRunning && !ambientStopRequested) {
      const rise = rand(5, 8);
      const hold = rand(8, 16);
      const fall = rand(6, 10);
      const silence = rand(7, 16);
      const peak = rand(0.05, 0.09);

      const start = ac.currentTime;
      crackle.gain.gain.cancelScheduledValues(start);
      crackle.gain.gain.setValueAtTime(0.0001, start);
      crackle.gain.gain.exponentialRampToValueAtTime(peak, start + rise);
      crackle.gain.gain.setValueAtTime(peak, start + rise + hold);
      crackle.gain.gain.exponentialRampToValueAtTime(0.0001, start + rise + hold + fall);
      await new Promise<void>(r => setTimeout(r, (rise + hold + fall + silence) * 1000));
    }
  })();

  // Warm pad scheduler — sparse, never overlapping with itself.
  while (!ambientStopRequested) {
    const gap = rand(14, 24);
    await new Promise<void>(r => setTimeout(r, gap * 1000));
    if (ambientStopRequested) break;
    playWarmSwell(ac);
  }

  crackleRunning = false;
  crackle.stop();
}

export function startAmbient(): void {
  if (ambientStarted) return;
  const ac = getCtx();
  if (!ac) return;
  ambientStarted = true;
  ambientStopRequested = false;
  ambientLoop(ac);
}

export function stopAmbient(): void {
  ambientStopRequested = true;
  ambientStarted = false;
}
