/**
 * Renders Dust & Iron brand PNGs from SVG sources.
 * Run: node scripts/generate-brand-assets.js
 */
const fs = require('fs');
const path = require('path');

const brandDir = path.join(__dirname, '..', 'assets', 'brand');
const outDir = path.join(__dirname, '..', 'assets', 'images');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Install sharp first: npm install --save-dev sharp');
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pngOptions = { compressionLevel: 9, adaptiveFiltering: true };

  async function render(svgName, outName, size) {
    const svgPath = path.join(brandDir, svgName);
    const outPath = path.join(outDir, outName);
    await sharp(svgPath).resize(size, size).png(pngOptions).toFile(outPath);
    const { size: bytes } = fs.statSync(outPath);
    console.log(`${outName} (${size}px) -> ${(bytes / 1024).toFixed(1)} KB`);
  }

  await render('icon.svg', 'icon.png', 1024);
  await render('splash-icon.svg', 'splash-icon.png', 512);
  await render('android-foreground.svg', 'android-icon-foreground.png', 1024);
  await render('android-monochrome.svg', 'android-icon-monochrome.png', 1024);
  await render('icon.svg', 'favicon.png', 48);

  // Flat dark plate for Android adaptive background (tiny solid PNG).
  const bgPath = path.join(outDir, 'android-icon-background.png');
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 5, g: 3, b: 8, alpha: 1 },
    },
  })
    .png(pngOptions)
    .toFile(bgPath);
  console.log(`android-icon-background.png (512px) -> ${(fs.statSync(bgPath).size / 1024).toFixed(1)} KB`);
}

void main();
