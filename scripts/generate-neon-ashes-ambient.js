/**
 * Generates a subtle looping Neon Ashes noir ambient WAV:
 * soft rain on glass, distant jazz club murmur, low city rumble,
 * vinyl crackle, and occasional muted sax/piano-like tones.
 *
 * Loop-safe: periodic layers use integer cycles over the full duration.
 */
const fs = require('fs');
const path = require('path');

const sampleRate = 22050;
const durationSeconds = 60;
const numSamples = sampleRate * durationSeconds;
const outputDir = path.join(__dirname, '..', 'assets', 'audio');
const outputPath = path.join(outputDir, 'neon-ashes-ambient.wav');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function loopSin(cyclesPerLoop, t, phase = 0) {
  return Math.sin((2 * Math.PI * cyclesPerLoop * t) / durationSeconds + phase);
}

function detRand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function envelope(t, start, length) {
  if (t < start || t >= start + length) return 0;
  const local = (t - start) / length;
  const attack = Math.min(local / 0.12, 1);
  const release = Math.min((1 - local) / 0.35, 1);
  return attack * release;
}

/** Softer mid-band rain — glass patter, not cyber hiss or frontier wind. */
function glassRain(t) {
  const layers = [
    [720, 0.0065, 0.0],
    [960, 0.0058, 0.9],
    [1280, 0.0048, 1.7],
    [1680, 0.0038, 2.4],
    [2160, 0.0032, 0.5],
    [2880, 0.0026, 1.2],
  ];
  let sum = 0;
  for (const [cycles, amp, phase] of layers) {
    sum += loopSin(cycles, t, phase) * amp;
  }
  const shimmer = 0.78 + 0.22 * loopSin(13, t, 0.3);
  return sum * shimmer;
}

function rainDrip(t, start, seed) {
  if (t < start || t >= start + 0.18) return 0;
  const local = (t - start) / 0.18;
  const tone = loopSin(5400, t, seed) * 0.55 + loopSin(8100, t, seed + 1.2) * 0.45;
  const noise = (detRand(seed + local * 400) * 2 - 1) * 0.35;
  return (tone + noise) * Math.sin(local * Math.PI) * 0.014;
}

/** Low muffled traffic / city undercurrent. */
function cityRumble(t) {
  const swell = 0.72 + 0.28 * loopSin(3, t, 0.8);
  const sub =
    loopSin(1980, t) * 0.016 +
    loopSin(2016, t, 0.6) * 0.012 +
    loopSin(2052, t, 1.1) * 0.009;
  const rumbleNoise =
    (detRand(t * 17.3) * 2 - 1) * 0.004 * (0.55 + 0.45 * loopSin(7, t, 1.4));
  return (sub + rumbleNoise) * swell;
}

/** Distant jazz club room tone and muffled band energy. */
function jazzClubBed(t) {
  const roomPulse = 0.45 + 0.55 * loopSin(5, t, 0.2);
  const roomTone =
    loopSin(1080, t) * 0.004 +
    loopSin(1620, t, 0.7) * 0.003 +
    loopSin(2160, t, 1.3) * 0.0025;
  const murmur =
    (detRand(t * 9.7 + 2.1) * 2 - 1) *
    0.0035 *
    (0.35 + 0.65 * loopSin(11, t, 2.0));
  const cymbalWash = loopSin(4320, t, 0.4) * loopSin(23, t, 1.1) * 0.0012;
  return (roomTone + murmur + cymbalWash) * roomPulse;
}

function vinylCrackle(t, start, seed) {
  if (t < start || t >= start + 0.035) return 0;
  const local = (t - start) / 0.035;
  const pop = (detRand(seed + local * 900) * 2 - 1) * Math.exp(-local * 14);
  const snap = loopSin(8800 + seed * 120, t, seed) * pop * 0.55;
  return (pop * 0.45 + snap) * 0.022;
}

/** Muted sax or piano-like phrase — warm, distant, not melodic hook. */
function mutedJazzTone(t, start, length, baseCycles, seed, kind = 'sax') {
  const env = envelope(t, start, length);
  if (env <= 0) return 0;

  const vibrato = 1 + 0.012 * loopSin(180, t, seed);
  const fundamental = loopSin(baseCycles, t, seed) * vibrato;
  const second = loopSin(baseCycles * 2, t, seed + 0.4) * 0.35;
  const third = loopSin(baseCycles * 3, t, seed + 0.9) * 0.18;

  if (kind === 'piano') {
    const hammer = loopSin(baseCycles * 6, t, seed + 1.6) * 0.08 * Math.exp(-((t - start) / length) * 3.5);
    return (fundamental * 0.55 + second * 0.25 + third * 0.12 + hammer) * env * 0.028;
  }

  const breath = (detRand(seed + t * 40) * 2 - 1) * 0.08 * env;
  return (fundamental * 0.62 + second * 0.28 + third * 0.14 + breath) * env * 0.032;
}

const dripTimes = [4.2, 11.8, 19.5, 27.3, 35.0, 42.6, 50.4, 57.2];
const crackleTimes = [2.1, 6.4, 9.8, 14.2, 17.6, 21.0, 24.5, 28.9, 32.3, 36.7, 40.1, 44.6, 48.0, 52.4, 55.8];
const jazzPhrases = [
  { start: 7.5, length: 2.4, cycles: 420, seed: 3.2, kind: 'sax' },
  { start: 16.0, length: 1.8, cycles: 560, seed: 8.7, kind: 'piano' },
  { start: 24.5, length: 2.2, cycles: 378, seed: 12.4, kind: 'sax' },
  { start: 33.0, length: 1.6, cycles: 630, seed: 19.1, kind: 'piano' },
  { start: 41.5, length: 2.0, cycles: 462, seed: 24.8, kind: 'sax' },
  { start: 50.0, length: 1.9, cycles: 504, seed: 31.5, kind: 'piano' },
];

const samples = new Float32Array(numSamples);
let peak = 0;

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;

  const rain = glassRain(t);
  let drips = 0;
  dripTimes.forEach((start, index) => {
    drips += rainDrip(t, start, index * 5.7 + 1.3);
  });

  const rumble = cityRumble(t);
  const jazz = jazzClubBed(t);

  let crackle = 0;
  crackleTimes.forEach((start, index) => {
    crackle += vinylCrackle(t, start, index * 3.9 + 0.6);
  });

  let phrases = 0;
  jazzPhrases.forEach((phrase) => {
    phrases += mutedJazzTone(t, phrase.start, phrase.length, phrase.cycles, phrase.seed, phrase.kind);
  });

  const raw = rain + drips + rumble + jazz + crackle + phrases;
  const sample = Math.max(-1, Math.min(1, raw * 0.94));
  samples[i] = sample;
  peak = Math.max(peak, Math.abs(sample));
}

const targetPeak = 0.4;
const gain = peak > 0 ? targetPeak / peak : 1;
for (let i = 0; i < numSamples; i++) {
  samples[i] *= gain;
}

const dataSize = numSamples * 2;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
  buffer.writeInt16LE(Math.floor(samples[i] * 32767), 44 + i * 2);
}

fs.writeFileSync(outputPath, buffer);
console.log(
  `Wrote ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB, ${durationSeconds}s @ ${sampleRate}Hz, peak ${(peak * gain).toFixed(3)})`,
);
