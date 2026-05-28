/**
 * Generates a subtle looping frontier ambient WAV:
 * brown-noise wind, low saloon hum, sparse wood creaks.
 */
const fs = require('fs');
const path = require('path');

const sampleRate = 22050;
const durationSeconds = 48;
const numSamples = sampleRate * durationSeconds;
const outputDir = path.join(__dirname, '..', 'assets', 'audio');
const outputPath = path.join(outputDir, 'dustfall-ambient.wav');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let brown = 0;
const samples = new Float32Array(numSamples);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const white = Math.random() * 2 - 1;
  brown = (brown + 0.015 * white) / 1.015;

  const wind = brown * 0.11;
  const gust = Math.sin(t * 0.07) * 0.015 + Math.sin(t * 0.023 + 1.4) * 0.01;
  const hum =
    Math.sin(t * 2 * Math.PI * 55) * 0.006 +
    Math.sin(t * 2 * Math.PI * 82.5) * 0.004 +
    Math.sin(t * 2 * Math.PI * 110) * 0.002;

  const creakWindow = t % 14;
  let creak = 0;
  if (creakWindow > 11.2 && creakWindow < 11.75) {
    const phase = (creakWindow - 11.2) / 0.55;
    creak = Math.sin(phase * Math.PI * 18) * 0.022 * (1 - phase);
  }
  if (creakWindow > 5.6 && creakWindow < 6.05) {
    const phase = (creakWindow - 5.6) / 0.45;
    creak += Math.sin(phase * Math.PI * 24) * 0.016 * (1 - phase);
  }

  const saloonMurmur = Math.sin(t * 2 * Math.PI * 0.35 + brown * 2) * 0.003;
  samples[i] = Math.max(-1, Math.min(1, wind + gust + hum + creak + saloonMurmur));
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
console.log(`Wrote ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
