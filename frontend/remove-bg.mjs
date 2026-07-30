import Jimp from 'jimp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, 'logo.jpeg');
const outputPath = path.join(__dirname, 'logo-transparent.png');

const image = await Jimp.read(inputPath);

// Tolerance for "white" detection — 0..255, higher = remove more near-white shades
const TOLERANCE = 40;

const white = { r: 255, g: 255, b: 255 };

image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
  const r = this.bitmap.data[idx + 0];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];

  const dr = Math.abs(r - white.r);
  const dg = Math.abs(g - white.g);
  const db = Math.abs(b - white.b);

  if (dr <= TOLERANCE && dg <= TOLERANCE && db <= TOLERANCE) {
    // Make pixel transparent
    this.bitmap.data[idx + 3] = 0;
  }
});

await image.writeAsync(outputPath);
console.log('Done! Saved to:', outputPath);
