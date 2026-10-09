import { useUI } from "./store";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let rollGain: GainNode | null = null;
let rollFilter: BiquadFilterNode | null = null;
let grindGain: GainNode | null = null;
let grindFilter: BiquadFilterNode | null = null;
let rollSource: AudioBufferSourceNode | null = null;
let grindSource: AudioBufferSourceNode | null = null;
let unlocked = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined" || !unlocked) return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    // Master bus
    master = ctx.createGain();
    master.gain.value = useUI.getState().muted ? 0 : 0.35;
    master.connect(ctx.destination);

    // SFX bus
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 1.0;
    sfxGain.connect(master);

    // Music bus
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.55;
    musicGain.connect(master);

    // Skateboard wheel rolling synth bus
    setupRollSynth(ctx, sfxGain);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Set up procedural skateboard wheel roll & rail grinding noise generators */
function setupRollSynth(c: AudioContext, destination: AudioNode) {
  const bufferSize = c.sampleRate * 2;
  const rollBuf = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = rollBuf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    data[i] = (b0 + b1 + b2) * 0.35;
  }

  // Roll node
  rollSource = c.createBufferSource();
  rollSource.buffer = rollBuf;
  rollSource.loop = true;

  rollFilter = c.createBiquadFilter();
  rollFilter.type = "lowpass";
  rollFilter.frequency.value = 450;
  rollFilter.Q.value = 1.2;

  rollGain = c.createGain();
  rollGain.gain.value = 0.0001;

  rollSource.connect(rollFilter).connect(rollGain).connect(destination);
  rollSource.start(0);

  // Grind node (metallic edge scrape)
  grindSource = c.createBufferSource();
  grindSource.buffer = rollBuf;
  grindSource.loop = true;

  grindFilter = c.createBiquadFilter();
  grindFilter.type = "bandpass";
  grindFilter.frequency.value = 2600;
  grindFilter.Q.value = 3.5;

  grindGain = c.createGain();
  grindGain.gain.value = 0.0001;

  grindSource.connect(grindFilter).connect(grindGain).connect(destination);
  grindSource.start(0);
}

// Subscribe to store mute state for instant responsive muting/unmuting
if (typeof window !== "undefined") {
  useUI.subscribe((state) => {
    if (master && ctx) {
      const target = state.muted ? 0.0001 : 0.35;
      master.gain.setTargetAtTime(target, ctx.currentTime, 0.04);
    }
  });
}

/** AudioContext suspended when hidden, resumed when visible */
export function suspendAudioForHiddenPage() {
  if (ctx) ctx.suspend().catch(() => {});
}
export function resumeAudioFromHiddenPage() {
  if (ctx && unlocked) ctx.resume().catch(() => {});
}

export function unlockAudio() {
  if (!unlocked) {
    unlocked = true;
    ensure();
    bgm.start();
  }
}

/* =========================================================================
 * CORE AUDIO SYNTHESIS PRIMITIVES (BEFORE / CLASSIC)
 * ========================================================================= */
function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  opts: { to?: number; vol?: number; delay?: number; attack?: number; targetBus?: GainNode } = {},
) {
  const c = ensure();
  if (!c || !master || useUI.getState().muted) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
  const vol = opts.vol ?? 0.5;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + (opts.attack ?? 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  const dest = opts.targetBus ?? sfxGain ?? master;
  osc.connect(g).connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, vol = 0.4, filterFreq = 1200, opts: { type?: BiquadFilterType; delay?: number; targetBus?: GainNode } = {}) {
  const c = ensure();
  if (!c || !master || useUI.getState().muted) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = opts.type ?? "lowpass";
  f.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  const dest = opts.targetBus ?? sfxGain ?? master;
  src.connect(f).connect(g).connect(dest);
  src.start(t0);
}

/* =========================================================================
 * 30 SOUND EFFECTS DARI ui-design-with-empty-background (1).zip (AFTER / UPDATE)
 * ========================================================================= */
export type Step = {
  freq: number;
  dur: number; // detik
  type?: OscillatorType;
  vol?: number;
  slide?: number; // frekuensi tujuan (glide)
  gap?: number; // jeda setelah nada
};

export function playSteps(steps: Step[], startGap = 0) {
  const ac = ensure();
  if (!ac || !master || useUI.getState().muted) return;
  let t = ac.currentTime + startGap;
  for (const s of steps) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = s.type ?? "square";
    osc.frequency.setValueAtTime(s.freq, t);
    if (s.slide) osc.frequency.linearRampToValueAtTime(s.slide, t + s.dur);
    const v = s.vol ?? 0.18;
    gain.gain.setValueAtTime(v, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + s.dur);
    osc.connect(gain).connect(sfxGain ?? master);
    osc.start(t);
    osc.stop(t + s.dur + 0.02);
    t += s.dur + (s.gap ?? 0);
  }
}

export function playNoiseStep(dur: number, vol = 0.2, fromFreq = 1800, toFreq = 200, delay = 0) {
  const ac = ensure();
  if (!ac || !master || useUI.getState().muted) return;
  const size = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, size, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const gain = ac.createGain();
  const t = ac.currentTime + delay;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(fromFreq, t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(toFreq, 40), t + dur);
  src.connect(filter).connect(gain).connect(sfxGain ?? master);
  src.start(t);
}

/* Suara khusus perhitungan skor dari ZIP */
export function playTick(pitch = 1) {
  playSteps([{ freq: 900 * pitch, dur: 0.035, vol: 0.07 }]);
}

export function playTallyDone() {
  playSteps([
    { freq: 988, dur: 0.09, vol: 0.16 },
    { freq: 1319, dur: 0.12, vol: 0.16 },
    { freq: 1760, dur: 0.3, vol: 0.18 },
  ]);
}

export type SoundId =
  | "gameover"
  | "coin"
  | "jump"
  | "click"
  | "splat"
  | "win"
  | "powerup"
  | "laser"
  | "explosion"
  | "hit"
  | "hurt"
  | "pickup"
  | "levelup"
  | "oneup"
  | "alarm"
  | "swoosh"
  | "teleport"
  | "shield"
  | "bomb"
  | "step"
  | "splash"
  | "chirp"
  | "honk"
  | "train"
  | "heart"
  | "unlock"
  | "error"
  | "combo"
  | "magic"
  | "fanfare";

export const SOUNDS: { id: SoundId; label: string; emoji: string }[] = [
  { id: "gameover", label: "GAME OVER", emoji: "💀" },
  { id: "coin", label: "COIN", emoji: "🪙" },
  { id: "jump", label: "JUMP", emoji: "🐤" },
  { id: "click", label: "CLICK", emoji: "👆" },
  { id: "splat", label: "SPLAT", emoji: "💥" },
  { id: "win", label: "WIN", emoji: "🏆" },
  { id: "powerup", label: "POWER UP", emoji: "⚡" },
  { id: "laser", label: "LASER", emoji: "🔫" },
  { id: "explosion", label: "EXPLOSION", emoji: "🧨" },
  { id: "hit", label: "HIT", emoji: "🥊" },
  { id: "hurt", label: "HURT", emoji: "🤕" },
  { id: "pickup", label: "PICK UP", emoji: "🎁" },
  { id: "levelup", label: "LEVEL UP", emoji: "📈" },
  { id: "oneup", label: "1-UP", emoji: "🍄" },
  { id: "alarm", label: "ALARM", emoji: "🚨" },
  { id: "swoosh", label: "SWOOSH", emoji: "🌪️" },
  { id: "teleport", label: "TELEPORT", emoji: "🌀" },
  { id: "shield", label: "SHIELD", emoji: "🛡️" },
  { id: "bomb", label: "BOMB", emoji: "💣" },
  { id: "step", label: "STEP", emoji: "👟" },
  { id: "splash", label: "SPLASH", emoji: "💧" },
  { id: "chirp", label: "CHIRP", emoji: "🐥" },
  { id: "honk", label: "HONK", emoji: "🚗" },
  { id: "train", label: "TRAIN", emoji: "🚂" },
  { id: "heart", label: "HEART", emoji: "❤️" },
  { id: "unlock", label: "UNLOCK", emoji: "🔓" },
  { id: "error", label: "ERROR", emoji: "❌" },
  { id: "combo", label: "COMBO", emoji: "🔥" },
  { id: "magic", label: "MAGIC", emoji: "✨" },
  { id: "fanfare", label: "FANFARE", emoji: "🎺" },
];

export function playSound(id: SoundId) {
  switch (id) {
    case "gameover":
      playSteps([
        { freq: 523, dur: 0.16 },
        { freq: 494, dur: 0.16 },
        { freq: 440, dur: 0.16 },
        { freq: 392, dur: 0.22 },
        { freq: 330, dur: 0.3, type: "triangle", vol: 0.22 },
        { freq: 262, dur: 0.45, type: "triangle", vol: 0.22 },
      ]);
      break;
    case "coin":
      playSteps([
        { freq: 988, dur: 0.08, vol: 0.15 },
        { freq: 1319, dur: 0.25, vol: 0.15 },
      ]);
      break;
    case "jump":
      playSteps([{ freq: 300, dur: 0.18, slide: 700, vol: 0.2 }]);
      break;
    case "click":
      playSteps([{ freq: 900, dur: 0.05, vol: 0.12 }]);
      break;
    case "splat":
      playNoiseStep(0.35, 0.3);
      playSteps([{ freq: 180, dur: 0.25, slide: 60, type: "sawtooth", vol: 0.2 }]);
      break;
    case "win":
      playSteps([
        { freq: 523, dur: 0.12 },
        { freq: 659, dur: 0.12 },
        { freq: 784, dur: 0.12 },
        { freq: 1047, dur: 0.3, vol: 0.2 },
        { freq: 784, dur: 0.12 },
        { freq: 1047, dur: 0.4, vol: 0.2 },
      ]);
      break;
    case "powerup":
      playSteps([
        { freq: 220, dur: 0.07, slide: 440 },
        { freq: 440, dur: 0.07, slide: 660 },
        { freq: 660, dur: 0.07, slide: 880 },
        { freq: 880, dur: 0.18, slide: 1320, vol: 0.16 },
      ]);
      break;
    case "laser":
      playSteps([{ freq: 1400, dur: 0.22, slide: 120, type: "sawtooth", vol: 0.15 }]);
      break;
    case "explosion":
      playNoiseStep(0.6, 0.35, 2500, 60);
      playSteps([{ freq: 120, dur: 0.5, slide: 30, type: "sawtooth", vol: 0.25 }]);
      break;
    case "hit":
      playNoiseStep(0.12, 0.25, 3000, 400);
      playSteps([{ freq: 350, dur: 0.1, slide: 100, vol: 0.2 }]);
      break;
    case "hurt":
      playSteps([
        { freq: 500, dur: 0.08, slide: 300, vol: 0.2 },
        { freq: 300, dur: 0.15, slide: 150, vol: 0.2 },
      ]);
      break;
    case "pickup":
      playSteps([
        { freq: 660, dur: 0.07, vol: 0.15 },
        { freq: 880, dur: 0.07, vol: 0.15 },
        { freq: 1175, dur: 0.15, vol: 0.15 },
      ]);
      break;
    case "levelup":
      playSteps([
        { freq: 392, dur: 0.1 },
        { freq: 523, dur: 0.1 },
        { freq: 659, dur: 0.1 },
        { freq: 784, dur: 0.1 },
        { freq: 1047, dur: 0.35, vol: 0.2 },
      ]);
      break;
    case "oneup":
      playSteps([
        { freq: 330, dur: 0.1 },
        { freq: 392, dur: 0.1 },
        { freq: 659, dur: 0.1 },
        { freq: 523, dur: 0.1 },
        { freq: 587, dur: 0.1 },
        { freq: 784, dur: 0.25, vol: 0.2 },
      ]);
      break;
    case "alarm":
      playSteps([
        { freq: 880, dur: 0.18, vol: 0.15 },
        { freq: 660, dur: 0.18, vol: 0.15 },
        { freq: 880, dur: 0.18, vol: 0.15 },
        { freq: 660, dur: 0.18, vol: 0.15 },
      ]);
      break;
    case "swoosh":
      playNoiseStep(0.3, 0.2, 400, 4000);
      break;
    case "teleport":
      playSteps([
        { freq: 200, dur: 0.06, slide: 1600, vol: 0.14 },
        { freq: 1600, dur: 0.06, slide: 200, vol: 0.14 },
        { freq: 200, dur: 0.06, slide: 1600, vol: 0.14 },
        { freq: 1600, dur: 0.12, slide: 100, vol: 0.14 },
      ]);
      break;
    case "shield":
      playSteps([
        { freq: 600, dur: 0.3, type: "triangle", vol: 0.2 },
        { freq: 900, dur: 0.3, type: "triangle", vol: 0.14 },
      ]);
      break;
    case "bomb":
      playNoiseStep(0.4, 0.08, 5000, 3000);
      playNoiseStep(0.5, 0.35, 2000, 50, 0.45);
      playSteps([{ freq: 100, dur: 0.4, slide: 25, type: "sawtooth", vol: 0.25 }], 0.45);
      break;
    case "step":
      playNoiseStep(0.07, 0.15, 900, 300);
      break;
    case "splash":
      playNoiseStep(0.35, 0.25, 1200, 150);
      playSteps([{ freq: 500, dur: 0.2, slide: 150, type: "sine", vol: 0.15 }]);
      break;
    case "chirp":
      playSteps([
        { freq: 2200, dur: 0.06, slide: 2800, vol: 0.1, gap: 0.05 },
        { freq: 2400, dur: 0.06, slide: 3000, vol: 0.1, gap: 0.05 },
        { freq: 2000, dur: 0.08, slide: 2600, vol: 0.1 },
      ]);
      break;
    case "honk":
      playSteps([
        { freq: 330, dur: 0.18, type: "sawtooth", vol: 0.18, gap: 0.06 },
        { freq: 330, dur: 0.3, type: "sawtooth", vol: 0.18 },
      ]);
      break;
    case "train":
      playSteps([{ freq: 311, dur: 0.5, type: "sawtooth", vol: 0.12 }]);
      playSteps([{ freq: 392, dur: 0.5, type: "sawtooth", vol: 0.12 }]);
      playSteps([{ freq: 466, dur: 0.5, type: "sawtooth", vol: 0.12 }]);
      break;
    case "heart":
      playSteps([
        { freq: 523, dur: 0.1, type: "sine", vol: 0.22, gap: 0.08 },
        { freq: 659, dur: 0.22, type: "sine", vol: 0.22 },
      ]);
      break;
    case "unlock":
      playSteps([
        { freq: 700, dur: 0.05, vol: 0.12, gap: 0.04 },
        { freq: 700, dur: 0.05, vol: 0.12, gap: 0.1 },
        { freq: 1047, dur: 0.25, vol: 0.18 },
      ]);
      break;
    case "error":
      playSteps([
        { freq: 220, dur: 0.15, type: "sawtooth", vol: 0.18, gap: 0.05 },
        { freq: 185, dur: 0.3, type: "sawtooth", vol: 0.18 },
      ]);
      break;
    case "combo":
      playSteps([
        { freq: 523, dur: 0.07, vol: 0.15 },
        { freq: 659, dur: 0.07, vol: 0.15 },
        { freq: 784, dur: 0.07, vol: 0.15 },
        { freq: 1047, dur: 0.07, vol: 0.15 },
        { freq: 1319, dur: 0.07, vol: 0.15 },
        { freq: 1568, dur: 0.15, vol: 0.15 },
      ]);
      break;
    case "magic":
      playSteps([
        { freq: 1047, dur: 0.07, type: "triangle", vol: 0.15 },
        { freq: 1319, dur: 0.07, type: "triangle", vol: 0.15 },
        { freq: 1760, dur: 0.07, type: "triangle", vol: 0.15 },
        { freq: 2093, dur: 0.07, type: "triangle", vol: 0.15 },
        { freq: 2637, dur: 0.2, type: "triangle", vol: 0.12 },
      ]);
      break;
    case "fanfare":
      playSteps([
        { freq: 392, dur: 0.14, vol: 0.18, gap: 0.02 },
        { freq: 392, dur: 0.07, vol: 0.18, gap: 0.02 },
        { freq: 392, dur: 0.07, vol: 0.18, gap: 0.02 },
        { freq: 523, dur: 0.3, vol: 0.2, gap: 0.05 },
        { freq: 659, dur: 0.14, vol: 0.18, gap: 0.02 },
        { freq: 784, dur: 0.45, vol: 0.22 },
      ]);
      break;
  }
}

/* =========================================================================
 * HYBRID SFX DISPATCHER (SUPPORTS "AFTER" [UPDATE ZIP] & "BEFORE" [KLASIK])
 * ========================================================================= */
const BREAD_SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];
let breadStep = 0;
let breadLast = 0;

export const sfx = {
  jump: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("jump");
    } else {
      tone(320, 0.14, "square", { to: 640, vol: 0.25 });
    }
  },
  land: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("step");
    } else {
      noise(0.06, 0.25, 600);
      tone(180, 0.05, "sine", { to: 80, vol: 0.2 });
    }
  },
  bread: () => {
    const now = performance.now();
    if (now - breadLast > 1200) breadStep = 0;
    breadLast = now;
    let i = breadStep;
    if (i >= BREAD_SCALE.length) i = BREAD_SCALE.length - 2 + (breadStep % 2);
    else breadStep = Math.min(breadStep + 1, BREAD_SCALE.length + 4);
    const f = BREAD_SCALE[i];
    tone(f, 0.09, "triangle", { to: f * 1.18, vol: 0.34, attack: 0.004 });
    tone(f * 2, 0.11, "sine", { vol: 0.22, delay: 0.02, attack: 0.004 });
  },
  countTick: (p: number) => {
    if (useUI.getState().soundProfile === "after") {
      playTick(0.8 + p * 1.2);
    } else {
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];
      const idx = Math.min(Math.floor(p * pentatonic.length), pentatonic.length - 1);
      const f = pentatonic[idx];
      tone(f, 0.04, "triangle", { to: f * 1.08, vol: 0.26, attack: 0.003 });
      tone(f * 2, 0.025, "sine", { vol: 0.14, attack: 0.002 });
    }
  },
  countDone: () => {
    if (useUI.getState().soundProfile === "after") {
      playTallyDone();
    } else {
      tone(130.81, 0.22, "sine", { to: 65, vol: 0.36 });
      tone(987.77, 0.12, "triangle", { vol: 0.38, attack: 0.003 });
      tone(1318.51, 0.38, "triangle", { vol: 0.44, delay: 0.06, attack: 0.003 });
      tone(2093, 0.48, "sine", { vol: 0.26, delay: 0.09, attack: 0.004 });
    }
  },
  fanfare: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("fanfare");
    } else {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((f, i) =>
        tone(f, i === notes.length - 1 ? 0.34 : 0.09, "triangle", {
          vol: 0.4,
          delay: i * 0.085,
          attack: 0.004,
        })
      );
      tone(2093, 0.4, "sine", { vol: 0.14, delay: 0.34, attack: 0.01 });
      noise(0.45, 0.1, 3600);
    }
  },
  breadCoin: (i: number) => {
    const L = BREAD_SCALE.length;
    const idx = i < L ? i : L - 2 + ((i - L) & 1);
    const f = BREAD_SCALE[idx];
    tone(f, 0.07, "triangle", { to: f * 1.15, vol: 0.26, attack: 0.003 });
  },
  trick: () => {
    if (useUI.getState().soundProfile === "after") {
      // Lebih lirih dan halus bila profile after aktif
      playSteps([{ freq: 523, dur: 0.05, type: "sine", vol: 0.04 }]);
    } else {
      // Suara freestyle sangat lembut, lirih, dan smooth (gelombang sine halus, volume kecil)
      tone(523, 0.07, "sine", { vol: 0.06, attack: 0.015 });
      tone(659, 0.08, "sine", { vol: 0.05, delay: 0.05, attack: 0.015 });
    }
  },
  bigTrick: () => {
    if (useUI.getState().soundProfile === "after") {
      playSteps([{ freq: 659, dur: 0.06, type: "sine", vol: 0.05 }]);
    } else {
      tone(523, 0.07, "sine", { vol: 0.07, attack: 0.015 });
      tone(659, 0.07, "sine", { vol: 0.06, delay: 0.05, attack: 0.015 });
      tone(784, 0.09, "sine", { vol: 0.06, delay: 0.1, attack: 0.015 });
    }
  },
  combo: (streak = 1) => {
    if (useUI.getState().soundProfile === "after") {
      playSteps([{ freq: 659, dur: 0.06, type: "sine", vol: 0.05 }]);
    } else {
      const rootNotes = [440, 523.25, 587.33, 659.25, 783.99];
      const idx = Math.min(Math.max(0, streak - 1), rootNotes.length - 2);
      tone(rootNotes[idx], 0.08, "sine", { vol: 0.05, attack: 0.015 });
      tone(rootNotes[idx + 1], 0.1, "sine", { vol: 0.05, delay: 0.05, attack: 0.015 });
    }
  },
  carve: () => {
    if (useUI.getState().soundProfile === "after") {
      playSteps([{ freq: 400, dur: 0.08, slide: 180, vol: 0.14 }]);
    } else {
      noise(0.09, 0.2, 1700);
      tone(360, 0.08, "sawtooth", { to: 160, vol: 0.16, attack: 0.005 });
    }
  },
  nearMiss: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("swoosh");
    } else {
      tone(659.25, 0.1, "triangle", { to: 987.77, vol: 0.32, attack: 0.003 });
      noise(0.14, 0.12, 3200);
    }
  },
  pigeonCheer: () => {
    if (useUI.getState().soundProfile === "after") {
      playSteps([{ freq: 880, dur: 0.05, type: "sine", vol: 0.04 }]);
    } else {
      tone(523, 0.08, "sine", { to: 659, vol: 0.06, attack: 0.015 });
    }
  },
  recordScratch: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("hurt");
    } else {
      tone(920, 0.22, "sawtooth", { to: 110, vol: 0.34 });
      noise(0.2, 0.25, 1500);
    }
  },
  grind: () => noise(0.08, 0.12, 3000),
  ramp: () => tone(200, 0.35, "sawtooth", { to: 900, vol: 0.2 }),
  sketchy: () => tone(220, 0.12, "sine", { to: 150, vol: 0.08, attack: 0.01 }),
  crash: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("splat");
    } else {
      noise(0.35, 0.6, 900);
      tone(220, 0.4, "sawtooth", { to: 60, vol: 0.3 });
    }
  },
  coo: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("chirp");
    } else {
      tone(330, 0.16, "sine", { to: 290, vol: 0.35 });
      tone(330, 0.2, "sine", { to: 270, vol: 0.35, delay: 0.16 });
    }
  },
  start: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("levelup");
    } else {
      tone(440, 0.08, "square", { vol: 0.25 });
      tone(660, 0.08, "square", { vol: 0.25, delay: 0.09 });
      tone(880, 0.16, "square", { vol: 0.25, delay: 0.18 });
    }
  },
  swish: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("swoosh");
    } else {
      noise(0.05, 0.08, 2500);
    }
  },
  bonk: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("hurt");
    } else {
      tone(480, 0.12, "sine", { to: 160, vol: 0.35 });
      tone(920, 0.08, "triangle", { to: 280, vol: 0.25 });
    }
  },
  thwack: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("hit");
    } else {
      tone(150, 0.13, "square", { to: 62, vol: 0.26 });
      noise(0.1, 0.2, 1400);
    }
  },
  gameover: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("gameover");
    } else {
      tone(523, 0.16, "triangle", { to: 440, vol: 0.3 });
      tone(392, 0.22, "triangle", { to: 330, vol: 0.3, delay: 0.16 });
      tone(262, 0.45, "triangle", { vol: 0.35, delay: 0.38 });
    }
  },
  shield: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("shield");
    } else {
      tone(600, 0.22, "triangle", { vol: 0.3 });
      tone(900, 0.22, "triangle", { vol: 0.25, delay: 0.08 });
    }
  },
  teleport: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("teleport");
    } else {
      tone(200, 0.2, "sawtooth", { to: 1200, vol: 0.2 });
    }
  },
  bomb: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("bomb");
    } else {
      noise(0.5, 0.35, 2000);
      tone(100, 0.4, "sawtooth", { to: 25, vol: 0.25 });
    }
  },
  oneup: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("oneup");
    } else {
      tone(330, 0.1, "triangle", { vol: 0.3 });
      tone(392, 0.1, "triangle", { vol: 0.3, delay: 0.08 });
      tone(659, 0.1, "triangle", { vol: 0.3, delay: 0.16 });
      tone(523, 0.1, "triangle", { vol: 0.3, delay: 0.24 });
      tone(587, 0.1, "triangle", { vol: 0.3, delay: 0.32 });
      tone(784, 0.25, "triangle", { vol: 0.35, delay: 0.4 });
    }
  },
  heart: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("heart");
    } else {
      tone(523, 0.1, "sine", { vol: 0.3 });
      tone(659, 0.22, "sine", { vol: 0.25, delay: 0.08 });
    }
  },
  yelp: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("hurt");
    } else {
      tone(620, 0.18, "square", { to: 880, vol: 0.16 });
    }
  },
  boing: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("jump");
    } else {
      tone(240, 0.26, "sine", { to: 780, vol: 0.22 });
      tone(780, 0.16, "sine", { to: 320, vol: 0.12, delay: 0.14 });
    }
  },
  horn: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("honk");
    } else {
      tone(392, 0.13, "square", { vol: 0.22 });
      tone(392, 0.2, "square", { vol: 0.22, delay: 0.18 });
    }
  },
  squawk: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("chirp");
    } else {
      tone(980, 0.22, "sawtooth", { to: 320, vol: 0.28 });
      noise(0.15, 0.25, 2500);
    }
  },
  motor: () => {
    tone(150, 0.3, "sawtooth", { to: 230, vol: 0.2 });
    tone(300, 0.22, "square", { to: 420, vol: 0.12, delay: 0.04 });
    noise(0.18, 0.14, 700);
  },
  cluck: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("chirp");
    } else {
      tone(720, 0.05, "triangle", { to: 520, vol: 0.18 });
    }
  },
  click: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("click");
    } else {
      tone(720, 0.05, "square", { vol: 0.16 });
    }
  },
  unlock: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("unlock");
    } else {
      tone(523, 0.08, "triangle", { vol: 0.4 });
      tone(659, 0.08, "triangle", { vol: 0.4, delay: 0.08 });
      tone(784, 0.08, "triangle", { vol: 0.4, delay: 0.16 });
      tone(1046, 0.25, "triangle", { vol: 0.45, delay: 0.24 });
    }
  },
  deny: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("error");
    } else {
      tone(160, 0.18, "sawtooth", { to: 110, vol: 0.2 });
    }
  },
  whoosh: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("swoosh");
    } else {
      noise(0.25, 0.14, 900);
    }
  },
  bell: (alt: boolean, vol = 0.2) => {
    // Autentik bel perlintasan kereta Jepang: nada lembut bergantian (C6 / G#5) tanpa sirene alarm
    tone(alt ? 1046 : 830, 0.05, "triangle", { vol: vol * 0.85, attack: 0.003 });
    tone(alt ? 1046 : 830, 0.24, "sine", { vol: vol * 0.55, attack: 0.003 });
  },
  trainHorn: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("train");
    } else {
      tone(311, 0.75, "sawtooth", { vol: 0.14, attack: 0.03 });
      tone(415, 0.75, "sawtooth", { vol: 0.14, attack: 0.03 });
    }
  },
  subwayHorn: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("train");
    } else {
      tone(277, 0.9, "sawtooth", { vol: 0.28, attack: 0.02 });
      tone(370, 0.9, "sawtooth", { vol: 0.26, attack: 0.02 });
      tone(415, 0.85, "triangle", { vol: 0.18, attack: 0.02 });
      noise(0.35, 0.08, 1200);
    }
  },
  subwayWhoosh: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("swoosh");
    }
    playNoiseStep(0.6, 0.28, 1800, 220);
    tone(150, 0.4, "sine", { to: 75, vol: 0.16, attack: 0.04 });
  },
  trainWhoosh: (vol = 0.35) => {
    if (useUI.getState().soundProfile === "after") {
      playSound("swoosh");
    }
    // Sapuan angin aerodinamis deras saat kereta melaju kencang
    playNoiseStep(0.65, vol, 2400, 160);
    tone(160, 0.42, "sine", { to: 70, vol: vol * 0.35, attack: 0.04 });
  },
  rumble: (vol = 0.16) => {
    // Getaran rel halus & bulat (bass lembut tanpa desis berulang kasar)
    tone(62, 0.24, "sine", { to: 48, vol: vol * 0.55 });
    noise(0.18, vol * 0.22, 200);
  },
  splash: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("splash");
    } else {
      noise(0.18, 0.22, 1800);
      tone(520, 0.12, "sine", { to: 260, vol: 0.12 });
    }
  },
  nos: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("explosion");
    } else {
      noise(0.6, 0.35, 2200);
      tone(120, 0.9, "sawtooth", { to: 480, vol: 0.22, attack: 0.02 });
    }
  },
  nosReady: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("powerup");
    } else {
      tone(660, 0.08, "square", { vol: 0.2 });
      tone(990, 0.16, "square", { vol: 0.2, delay: 0.09 });
    }
  },
  sprint: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("powerup");
    } else {
      noise(0.28, 0.12, 2000);
      tone(280, 0.28, "triangle", { to: 760, vol: 0.18, attack: 0.02 });
    }
  },
  rare: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("magic");
    } else {
      tone(523, 0.09, "triangle", { vol: 0.32, attack: 0.005 });
      tone(784, 0.09, "triangle", { vol: 0.3, delay: 0.07 });
      tone(1046, 0.14, "triangle", { vol: 0.3, delay: 0.14 });
      tone(1568, 0.22, "sine", { vol: 0.24, delay: 0.21 });
      noise(0.5, 0.1, 3200);
    }
  },
  nosPickup: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("pickup");
    } else {
      tone(440, 0.06, "triangle", { vol: 0.3 });
      tone(660, 0.06, "triangle", { vol: 0.3, delay: 0.06 });
      tone(880, 0.12, "triangle", { vol: 0.3, delay: 0.12 });
    }
  },
  meow: () => {
    tone(480, 0.35, "triangle", { to: 820, vol: 0.35, attack: 0.03 });
    tone(780, 0.32, "sine", { to: 360, vol: 0.3, delay: 0.14 });
  },
  purr: () => tone(180, 0.22, "triangle", { to: 140, vol: 0.15 }),
  bark: (big = false) => {
    if (big) {
      tone(260, 0.16, "sawtooth", { to: 140, vol: 0.32, attack: 0.01 });
      noise(0.2, 0.12, 1200);
    } else {
      tone(560, 0.1, "triangle", { to: 340, vol: 0.28, attack: 0.01 });
      tone(680, 0.11, "triangle", { to: 380, vol: 0.26, delay: 0.08, attack: 0.01 });
    }
  },
  letterPickup: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("pickup");
    } else {
      tone(784, 0.07, "triangle", { vol: 0.35 });
      tone(988, 0.08, "triangle", { vol: 0.35, delay: 0.06 });
      tone(1318, 0.16, "triangle", { vol: 0.4, delay: 0.12 });
    }
  },
  mysteryBox: () => {
    if (useUI.getState().soundProfile === "after") {
      playSound("win");
    } else {
      tone(523, 0.1, "triangle", { vol: 0.4 });
      tone(659, 0.1, "triangle", { vol: 0.4, delay: 0.08 });
      tone(784, 0.1, "triangle", { vol: 0.4, delay: 0.16 });
      tone(1046, 0.28, "triangle", { vol: 0.45, delay: 0.24 });
    }
  },
};

/* =========================================================================
 * PROCEDURAL RETRO ARCADE BGM ENGINE
 * ========================================================================= */
const N = {
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

const SKATE_MELODY: Array<number | 0> = [
  N.C5, 0, N.G4, 0, N.A4, 0, 0, N.C5, N.D5, 0, 0, 0, N.E5, 0, N.D5, 0,
  N.C5, 0, 0, N.A4, 0, 0, N.G4, 0, N.A4, 0, N.C5, 0, N.D5, 0, N.C5, 0,
  N.E5, 0, N.G5, 0, N.A5, 0, N.G5, 0, N.E5, 0, 0, N.D5, N.C5, 0, 0, 0,
  N.D5, 0, N.E5, 0, N.D5, 0, 0, N.C5, N.A4, 0, N.C5, 0, N.D5, 0, N.E5, 0,
];

const SKATE_BASS: Array<number | 0> = [
  N.C2, 0, 0, N.C2, 0, 0, N.G2, 0, N.C3, 0, N.Bb2, 0, N.C2, 0, N.G2, 0,
  N.F2, 0, 0, N.F2, 0, 0, N.C3, 0, N.F3, 0, N.Eb2, 0, N.F2, 0, N.G2, 0,
  N.A2, 0, 0, N.A2, 0, 0, N.E2, 0, N.A3, 0, N.G2, 0, N.A2, 0, N.E2, 0,
  N.G2, 0, 0, N.G2, 0, 0, N.D2, 0, N.G3, 0, N.F2, 0, N.G2, 0, N.B2, 0,
];

const MENU_MELODY: Array<number | 0> = [
  N.E4, 0, N.G4, 0, N.C5, 0, 0, 0, N.B4, 0, N.G4, 0, N.E4, 0, 0, 0,
  N.F4, 0, N.A4, 0, N.D5, 0, 0, 0, N.C5, 0, N.A4, 0, N.G4, 0, 0, 0,
];

const MENU_BASS: Array<number | 0> = [
  N.C2, 0, 0, 0, N.G2, 0, 0, 0, N.A2, 0, 0, 0, N.E2, 0, 0, 0,
  N.F2, 0, 0, 0, N.C2, 0, 0, 0, N.G2, 0, 0, 0, N.D2, 0, 0, 0,
];

class SoundEngineBGM {
  private active = false;
  private currentPhase: "menu" | "playing" | "crashed" | "gameover" = "menu";
  private currentStep = 0;
  private nextStepTime = 0;
  private intervalId: number | null = null;
  private isBoosted = false;

  start() {
    if (this.active) return;
    this.active = true;
    const c = ensure();
    if (!c) return;
    this.nextStepTime = c.currentTime + 0.05;
    this.currentStep = 0;
    this.intervalId = window.setInterval(() => this.schedule(), 35);
  }

  stop() {
    this.active = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setPhase(phase: "menu" | "playing" | "crashed" | "gameover") {
    const prev = this.currentPhase;
    this.currentPhase = phase;
    if (phase === "crashed") {
      sfx.recordScratch();
    } else if (phase === "playing" && prev !== "playing") {
      this.currentStep = 0;
      const c = ensure();
      if (c) this.nextStepTime = c.currentTime + 0.02;
    }
  }

  boost(active: boolean) {
    this.isBoosted = active;
  }

  updateRoll(speed: number, onGround: boolean, isGrinding: boolean) {
    const c = ensure();
    if (!c || !rollGain || !rollFilter || !grindGain) return;
    if (useUI.getState().muted || this.currentPhase !== "playing") {
      rollGain.gain.setTargetAtTime(0.0001, c.currentTime, 0.03);
      grindGain.gain.setTargetAtTime(0.0001, c.currentTime, 0.03);
      return;
    }

    if (onGround && speed > 1) {
      const normSpeed = Math.min(speed / 24, 1.6);
      const targetVol = 0.03 + normSpeed * 0.09;
      const targetCutoff = 380 + normSpeed * 750;
      rollGain.gain.setTargetAtTime(targetVol, c.currentTime, 0.03);
      rollFilter.frequency.setTargetAtTime(targetCutoff, c.currentTime, 0.04);
    } else {
      rollGain.gain.setTargetAtTime(0.0001, c.currentTime, 0.02);
    }

    if (isGrinding && onGround) {
      grindGain.gain.setTargetAtTime(0.12, c.currentTime, 0.02);
    } else {
      grindGain.gain.setTargetAtTime(0.0001, c.currentTime, 0.03);
    }
  }

  private schedule() {
    const c = ensure();
    if (!c || !musicGain || useUI.getState().muted) return;

    let bpm = 126;
    if (this.currentPhase === "menu") bpm = 104;
    else if (this.isBoosted) bpm = 138;

    const secondsPerBeat = 60 / bpm;
    const stepDur = secondsPerBeat / 4;

    while (this.nextStepTime < c.currentTime + 0.12) {
      this.playStep(this.currentStep, this.nextStepTime, stepDur);
      this.nextStepTime += stepDur;
      this.currentStep++;
    }
  }

  private playStep(step: number, t: number, stepDur: number) {
    if (this.currentPhase === "crashed") return;

    if (this.currentPhase === "playing") {
      const s = step % 64;
      this.playDrumStep(s, t);
      this.playSkateBass(s, t, stepDur);
      this.playSkateMelody(s, t, stepDur);
    } else if (this.currentPhase === "menu" || this.currentPhase === "gameover") {
      const s = step % 32;
      this.playMenuDrumStep(s, t);
      this.playMenuBass(s, t, stepDur);
      this.playMenuMelody(s, t, stepDur);
    }
  }

  private playDrumStep(s: number, t: number) {
    const stepInBar = s % 16;
    if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 14) {
      this.synthKick(t, stepInBar === 0 ? 0.38 : 0.28);
    }
    if (stepInBar === 4 || stepInBar === 12) {
      this.synthSnare(t, 0.28);
    } else if (stepInBar === 15) {
      this.synthSnare(t, 0.12);
    }
    if (stepInBar % 2 === 0) {
      const isOffbeat = stepInBar === 2 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14;
      this.synthHat(t, isOffbeat ? 0.14 : 0.08, isOffbeat);
    }
  }

  private playMenuDrumStep(s: number, t: number) {
    const stepInBar = s % 16;
    if (stepInBar === 0) this.synthKick(t, 0.22);
    if (stepInBar === 8) this.synthSnare(t, 0.14);
    if (stepInBar % 4 === 2) this.synthHat(t, 0.06, false);
  }

  private synthKick(t: number, vol: number) {
    const c = ensure();
    if (!c || !musicGain) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.08);

    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

    osc.connect(g).connect(musicGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  private synthSnare(t: number, vol: number) {
    const c = ensure();
    if (!c || !musicGain) return;
    const osc = c.createOscillator();
    const gOsc = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(230, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.07);
    gOsc.gain.setValueAtTime(vol * 0.7, t);
    gOsc.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gOsc).connect(musicGain);
    osc.start(t);
    osc.stop(t + 0.1);

    noise(0.12, vol * 0.8, 2400, { delay: t - c.currentTime, targetBus: musicGain });
  }

  private synthHat(t: number, vol: number, open = false) {
    const dur = open ? 0.09 : 0.035;
    noise(dur, vol, 7500, {
      type: "highpass",
      delay: (ensure()?.currentTime ?? 0) > t ? 0 : t - (ensure()?.currentTime ?? 0),
      targetBus: musicGain ?? undefined,
    });
  }

  private playSkateBass(s: number, t: number, stepDur: number) {
    const note = SKATE_BASS[s];
    if (!note) return;
    const c = ensure();
    if (!c || !musicGain) return;

    const osc = c.createOscillator();
    const filter = c.createBiquadFilter();
    const g = c.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(note, t);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(note * 5, t);
    filter.frequency.exponentialRampToValueAtTime(note * 1.5, t + stepDur * 0.8);

    const dur = stepDur * 0.85;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(filter).connect(g).connect(musicGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playSkateMelody(s: number, t: number, stepDur: number) {
    const note = SKATE_MELODY[s];
    if (!note) return;
    const c = ensure();
    if (!c || !musicGain) return;

    const osc = c.createOscillator();
    const g = c.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(note, t);

    const dur = stepDur * 1.1;
    const vol = this.isBoosted ? 0.22 : 0.17;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g).connect(musicGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playMenuBass(s: number, t: number, stepDur: number) {
    const note = MENU_BASS[s];
    if (!note) return;
    const c = ensure();
    if (!c || !musicGain) return;

    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note, t);

    const dur = stepDur * 1.8;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.24, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g).connect(musicGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playMenuMelody(s: number, t: number, stepDur: number) {
    const note = MENU_MELODY[s];
    if (!note) return;
    const c = ensure();
    if (!c || !musicGain) return;

    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(note, t);

    const dur = stepDur * 1.4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g).connect(musicGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}

export const bgm = new SoundEngineBGM();
