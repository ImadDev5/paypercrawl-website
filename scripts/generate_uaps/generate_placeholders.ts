/**
 * Generate placeholder UAP .bin files for testing.
 *
 * These use structured mid-frequency sinusoidal patterns that approximate
 * the frequency content of real gradient-optimised UAPs.  They target
 * 3-7 pixels/cycle — the band ViTs are most sensitive to.
 *
 * THESE ARE NOT REAL ADVERSARIAL PERTURBATIONS.
 * Replace with output from scripts/generate_uaps/generate.py for
 * actual model-optimised protection.
 *
 * Usage:  npx tsx scripts/generate_uaps/generate_placeholders.ts
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const UAP_W = 224;
const UAP_H = 224;
const CHANNELS = 3;
const BYTES = UAP_W * UAP_H * CHANNELS; // 150528

interface CategoryDef {
  id: string;
  // Frequencies (pixels/cycle) and phases for each of several gratings
  gratings: { freqX: number; freqY: number; phase: number; weight: number }[];
  epsilon: number; // max amplitude (out of 127)
}

const categories: CategoryDef[] = [
  {
    id: "general",
    epsilon: 14,
    gratings: [
      { freqX: 3.5, freqY: 0, phase: 0, weight: 0.30 },
      { freqX: 0, freqY: 5, phase: 1.2, weight: 0.25 },
      { freqX: 4, freqY: 4, phase: 2.1, weight: 0.25 },
      { freqX: 7, freqY: 2, phase: 0.8, weight: 0.20 },
    ],
  },
  {
    id: "landscape",
    epsilon: 16,
    gratings: [
      { freqX: 5, freqY: 0, phase: 0.5, weight: 0.35 },
      { freqX: 0, freqY: 3, phase: 1.8, weight: 0.30 },
      { freqX: 6, freqY: 6, phase: 3.2, weight: 0.20 },
      { freqX: 4, freqY: 7, phase: 0.3, weight: 0.15 },
    ],
  },
  {
    id: "face",
    epsilon: 10,
    gratings: [
      { freqX: 4, freqY: 0, phase: 0.9, weight: 0.30 },
      { freqX: 0, freqY: 4, phase: 2.5, weight: 0.30 },
      { freqX: 3, freqY: 3, phase: 1.1, weight: 0.25 },
      { freqX: 5, freqY: 7, phase: 0.2, weight: 0.15 },
    ],
  },
  {
    id: "text",
    epsilon: 18,
    gratings: [
      { freqX: 3, freqY: 0, phase: 1.5, weight: 0.35 },
      { freqX: 0, freqY: 3, phase: 0.7, weight: 0.35 },
      { freqX: 5, freqY: 5, phase: 2.8, weight: 0.20 },
      { freqX: 7, freqY: 0, phase: 3.5, weight: 0.10 },
    ],
  },
  {
    id: "product",
    epsilon: 14,
    gratings: [
      { freqX: 4.5, freqY: 0, phase: 2.0, weight: 0.30 },
      { freqX: 0, freqY: 6, phase: 0.4, weight: 0.25 },
      { freqX: 3, freqY: 5, phase: 1.7, weight: 0.25 },
      { freqX: 7, freqY: 3, phase: 3.1, weight: 0.20 },
    ],
  },
  {
    id: "art",
    epsilon: 16,
    gratings: [
      { freqX: 5.5, freqY: 0, phase: 0.3, weight: 0.25 },
      { freqX: 0, freqY: 4.5, phase: 2.2, weight: 0.25 },
      { freqX: 6, freqY: 3, phase: 1.0, weight: 0.25 },
      { freqX: 3, freqY: 7, phase: 3.8, weight: 0.25 },
    ],
  },
  {
    id: "urban",
    epsilon: 15,
    gratings: [
      { freqX: 3, freqY: 3, phase: 1.4, weight: 0.30 },
      { freqX: 6, freqY: 0, phase: 0.6, weight: 0.25 },
      { freqX: 0, freqY: 5, phase: 2.9, weight: 0.25 },
      { freqX: 4, freqY: 7, phase: 3.3, weight: 0.20 },
    ],
  },
  {
    id: "abstract",
    epsilon: 18,
    gratings: [
      { freqX: 7, freqY: 0, phase: 0.1, weight: 0.25 },
      { freqX: 0, freqY: 7, phase: 1.6, weight: 0.25 },
      { freqX: 5, freqY: 5, phase: 2.4, weight: 0.25 },
      { freqX: 3, freqY: 4, phase: 3.7, weight: 0.25 },
    ],
  },
];

function generateUAP(cat: CategoryDef): Int8Array {
  const buf = new Int8Array(BYTES);

  for (let y = 0; y < UAP_H; y++) {
    for (let x = 0; x < UAP_W; x++) {
      for (let c = 0; c < CHANNELS; c++) {
        let value = 0;
        for (const g of cat.gratings) {
          // Phase offset per channel for inter-channel decorrelation
          const channelPhase = g.phase + c * 2.094; // 2π/3 per channel
          const fx = (2 * Math.PI * x) / g.freqX;
          const fy = (2 * Math.PI * y) / g.freqY;
          // Handle zero-frequency (DC) components gracefully
          const sx = g.freqX > 0 ? Math.sin(fx + channelPhase) : 0;
          const sy = g.freqY > 0 ? Math.sin(fy + channelPhase * 0.7) : 0;
          // Combine horizontal and vertical gratings
          value += g.weight * (g.freqX > 0 && g.freqY > 0
            ? (sx + sy) / 2
            : g.freqX > 0 ? sx : sy);
        }
        // Scale to [-epsilon, +epsilon] and clamp to int8
        const scaled = Math.round(value * cat.epsilon);
        buf[(y * UAP_W + x) * CHANNELS + c] = Math.max(-128, Math.min(127, scaled));
      }
    }
  }

  return buf;
}

// ── Main ──

const outDir = join(process.cwd(), "public", "uaps");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

console.log("Generating placeholder UAPs...\n");

for (const cat of categories) {
  const uap = generateUAP(cat);
  const outPath = join(outDir, `${cat.id}.bin`);
  writeFileSync(outPath, Buffer.from(uap.buffer));
  console.log(`  ✓ ${cat.id}.bin  (${uap.length} bytes, ε=${cat.epsilon})`);
}

console.log(`\nGenerated ${categories.length} placeholder UAPs in ${outDir}`);
console.log("⚠  These are structured noise patterns, NOT gradient-optimised.");
console.log("   Run scripts/generate_uaps/generate.py for real protection.\n");
