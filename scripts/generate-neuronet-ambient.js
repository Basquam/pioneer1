/**
 * Generates a subtle looping NeuroNet cyberpunk ambient WAV:
 * soft rain bed, low synth drone, pulsing bass, digital glitch blips, neon city hum.
 *
 * Loop-safe: periodic layers use integer cycles over the full duration.
 */
const fs = require('fs');
const path = require('path');

const sampleRate = 22050;
const durationSeconds = 54;
const numSamples = sampleRate * durationSeconds;
const outputDir = path.join(__dirname, '..', 'assets', 'audio');
const outputPath = path.join(outputDir, 'neuronet-ambient.wav');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function loopSin(cyclesPerLoop, t, phase = 0) {
  return Math.sin((2 * Math.PI * cyclesPerLoop * t) / durationSeconds + phase);
}

function smoothPulse(t, period, duty = 0.18) {
  const phase = (t % period) / period;
  if (phase > duty) return 0;
  const x = phase / duty;
  return Math.sin(x * Math.PI);
}

function detRand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function glitchBurst(t, start, length, seed) {
  if (t < start || t >= start + length) return 0;
  const local = (t - start) / length;
  const decay = 1 - local;
  const tick = Math.sin(local * Math.PI * 44) * decay;
  const noise = (detRand(seed + local * 1000) * 2 - 1) * decay;
  const square = local < 0.08 ? 1 : local < 0.16 ? -1 : 0;
  return tick * 0.55 + noise * 0.35 + square * 0.1;
}

/** High-frequency loop-safe rain texture (bright hiss, not brown wind). */
function rainBed(t) {
  const harmonics = [
    [4200, 0.0042, 0.2],
    [5100, 0.0038, 1.1],
    [6300, 0.0034, 2.4],
    [7800, 0.0031, 0.7],
    [9200, 0.0028, 1.9],
    [10400, 0.0025, 2.8],
  ];
  let sum = 0;
  for (const [cycles, amp, phase] of harmonics) {
    sum += loopSin(cycles, t, phase) * amp;
  }
  return sum * (0.82 + 0.18 * loopSin(17, t, 0.5));
}

const glitchTimes = [5.5, 13.25, 22.0, 30.75, 39.5, 48.25];

const samples = new Float32Array(numSamples);
let peak = 0;

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;

  const rain = rainBed(t);

  const droneSweep = 0.65 + 0.35 * loopSin(4, t, 0.4);
  const synthDrone =
    loopSin(2970, t) * 0.018 +
    loopSin(2997, t, 0.7) * 0.014 +
    loopSin(3024, t, 1.3) * 0.011 +
    loopSin(1485, t, 2.1) * 0.008 * droneSweep;

  const pulseEnv = smoothPulse(t, 4.5, 0.22);
  const pulsingBass =
    (loopSin(2268, t) * 0.7 + loopSin(2295, t, 0.5) * 0.3) * pulseEnv * 0.022;

  const neonTremolo = 0.55 + 0.45 * loopSin(11, t, 1.8);
  const neonRaw =
    loopSin(9720, t) * 0.004 +
    loopSin(11880, t, 0.9) * 0.0035 +
    loopSin(12960, t, 1.6) * 0.003;
  const neonCityHum = neonRaw * neonTremolo * 1.2;

  let glitch = 0;
  glitchTimes.forEach((start, index) => {
    glitch += glitchBurst(t, start, 0.065, index * 17.3 + 4.1);
  });
  glitch *= 0.028;

  const buzz =
    loopSin(4320, t) * loopSin(27, t, 0.2) * 0.0025 +
    loopSin(8640, t, 1.1) * 0.0012;

  const raw = rain + synthDrone + pulsingBass + neonCityHum + glitch + buzz;
  const sample = Math.max(-1, Math.min(1, raw * 0.92));
  samples[i] = sample;
  peak = Math.max(peak, Math.abs(sample));
}

const targetPeak = 0.42;
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
