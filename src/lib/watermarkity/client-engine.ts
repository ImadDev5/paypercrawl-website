/**
 * Watermarkity Client Engine v3 — Browser-Compatible
 *
 * Runs in Web Worker or main thread.  Zero Node.js dependencies.
 * Replaces the Sharp-based server engine with a mathematically
 * superior approach targeting Vision Language Model (VLM) encoders.
 *
 * Architecture:
 *   Layer 0 — Pre-computed UAP application (gradient-optimised offline)
 *   Layer 1 — ViT patch-correlated perturbation with YCbCr weighting
 *   Layer 2 — DCT mid-frequency coefficient perturbation
 *   Layer 3 — Chromatic aberration injection
 *   Layer 4 — Block-average QIM watermark (JPEG-resilient, for verification)
 */

/* ================================================================
   Types
   ================================================================ */

export type WatermarkMode = "robust" | "balanced" | "forensic";
export type ProtectionProfile = "visible" | "hybrid" | "invisible";

export interface ModeConfig {
  repeatFactor: number;      // QIM embed repetitions per payload bit
  patchEpsilon: number;      // base L∞ budget for patch perturbation (0-255)
  cbCrWeight: number;        // fraction of perturbation budget in chroma (0-1)
  uapStrength: number;       // UAP blending alpha (0-1)
  dctAlpha: number;          // DCT mid-freq coefficient multiplier
  qimDelta: number;          // QIM quantization step
  jpegQuality: number;       // recommended output quality (0-1)
  channelsUsed: number;      // always 3 (RGB)
  chromaShiftPx: number;     // chromatic aberration offset in pixels
}

export type ProgressCallback = (layer: string, percent: number) => void;

export interface VisibleWatermarkOptions {
  enabled?: boolean;
  text?: string;
  opacity?: number;
}

export interface UapLayerInput {
  data: Int8Array;
  width: number;
  height: number;
  strength?: number;
  label?: string;
}

export interface ProcessInput {
  rgbaPixels: Uint8Array;    // RGBA from canvas getImageData
  width: number;
  height: number;
  jobId: string;
  mode: WatermarkMode;
  protectionProfile?: ProtectionProfile;
  visibleWatermark?: VisibleWatermarkOptions;
  uapData?: Int8Array | null;  // pre-computed UAP (224×224×3 int8)
  uapLayers?: UapLayerInput[] | null;
  uapWidth?: number;
  uapHeight?: number;
  onProgress?: ProgressCallback;
}

export interface ProcessResult {
  rgbaPixels: Uint8Array;    // modified RGBA — draw to canvas, export as JPEG
  width: number;
  height: number;
  payload: string;
  repeatFactor: number;
  mode: WatermarkMode;
  protectionProfile: ProtectionProfile;
  verification: {
    detector: string;
    confidence: number;
    watermarkId: string;
    directAccuracy: number;
  };
  visibleWatermark: {
    enabled: boolean;
    text: string | null;
  };
  uapProfile: {
    strategy: "none" | "single" | "ensemble";
    layers: string[];
  };
}

export interface VerifyInput {
  rgbaPixels: Uint8Array;
  width: number;
  height: number;
  jobId: string;
  mode: WatermarkMode;
  payload: string;
  repeatFactor?: number;
  protectionProfile?: ProtectionProfile;
}

export interface VerifyResult {
  detector: string;
  confidence: number;
  watermarkId: string;
  directAccuracy: number;
  recoveredPayload: string;
  repeatFactor: number;
  detected: boolean;
  payloadCodec: "raw" | "h74";
}

/* ================================================================
   Constants
   ================================================================ */

const VIT_PATCH = 14;           // CLIP ViT-L/14 patch size in pixels
const BLOCK = 8;                // DCT / JPEG block size
const BLOCK_PX = BLOCK * BLOCK; // 64

/* ================================================================
   Utility helpers
   ================================================================ */

/** FNV-1a hash → unsigned 32-bit integer (for PRNG seeding) */
function h32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Dual-FNV hash → 16 hex chars (for payload digest) */
function hexHash(s: string): string {
  let a = 0x811c9dc5;
  let b = 0x12345678;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a ^= c;
    a = Math.imul(a, 0x01000193);
    b ^= c;
    b = Math.imul(b, 0x01000033);
  }
  return (a >>> 0).toString(16).padStart(8, "0") +
    (b >>> 0).toString(16).padStart(8, "0");
}

/** xorshift32 PRNG — deterministic, fast */
function xorshift32(seed: number) {
  let s = seed || 2463534242;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

function getClientRuntimeProfile(pixelCount: number) {
  if (pixelCount >= 1_350_000) {
    return {
      skipDct: true,
      dctChannels: [1] as const,
      dctBlockStep: 4,
      repeatCap: 10,
      patchGridStep: 3,
      preferVisibleFallback: true,
      chromaShiftOverride: 1,
    };
  }

  if (pixelCount >= 900_000) {
    return {
      skipDct: true,
      dctChannels: [1] as const,
      dctBlockStep: 3,
      repeatCap: 12,
      patchGridStep: 2,
      preferVisibleFallback: true,
      chromaShiftOverride: 1,
    };
  }

  if (pixelCount >= 700_000) {
    return {
      skipDct: false,
      dctChannels: [1] as const,
      dctBlockStep: 2,
      repeatCap: 18,
      patchGridStep: 2,
      preferVisibleFallback: false,
      chromaShiftOverride: undefined,
    };
  }

  return {
    skipDct: false,
    dctChannels: [0, 1, 2] as const,
    dctBlockStep: 1,
    repeatCap: 30,
    patchGridStep: 1,
    preferVisibleFallback: false,
    chromaShiftOverride: undefined,
  };
}

/* ================================================================
   Mode configuration
   ================================================================ */

export function modeConfig(mode: WatermarkMode): ModeConfig {
  switch (mode) {
    case "robust":
      return {
        repeatFactor: 20,
        patchEpsilon: 14,     // subtle — low visual impact
        cbCrWeight: 0.70,     // 70% perturbation in chroma channels
        uapStrength: 0.6,
        dctAlpha: 0.12,
        qimDelta: 16,
        jpegQuality: 0.95,
        channelsUsed: 3,
        chromaShiftPx: 1,
      };
    case "balanced":
      return {
        repeatFactor: 30,
        patchEpsilon: 22,     // moderate — visible on close inspection
        cbCrWeight: 0.75,
        uapStrength: 0.8,
        dctAlpha: 0.20,
        qimDelta: 18,
        jpegQuality: 0.94,
        channelsUsed: 3,
        chromaShiftPx: 2,
      };
    case "forensic":
      return {
        repeatFactor: 45,
        patchEpsilon: 32,     // aggressive — clear artifacts, max AI disruption
        cbCrWeight: 0.80,
        uapStrength: 1.0,
        dctAlpha: 0.30,
        qimDelta: 22,
        jpegQuality: 0.93,
        channelsUsed: 3,
        chromaShiftPx: 3,
      };
  }
}

function buildPayload(jobId: string, mode: WatermarkMode): string {
  const issuedAt = Date.now().toString(36).slice(-6);
  const digest = hexHash(`${jobId}:${mode}:${issuedAt}`).slice(0, 12);
  return `WM4:${mode[0]}:${jobId.slice(-8)}:${issuedAt}:${digest}`;
}

/* ================================================================
   Pixel format helpers (RGBA ↔ RGB)
   ================================================================ */

function rgbaToRgb(rgba: Uint8Array, pixelCount: number): Uint8Array {
  const rgb = new Uint8Array(pixelCount * 3);
  for (let i = 0; i < pixelCount; i++) {
    rgb[i * 3] = rgba[i * 4];
    rgb[i * 3 + 1] = rgba[i * 4 + 1];
    rgb[i * 3 + 2] = rgba[i * 4 + 2];
  }
  return rgb;
}

function rgbToRgba(rgb: Uint8Array, pixelCount: number): Uint8Array {
  const rgba = new Uint8Array(pixelCount * 4);
  for (let i = 0; i < pixelCount; i++) {
    rgba[i * 4] = rgb[i * 3];
    rgba[i * 4 + 1] = rgb[i * 3 + 1];
    rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

function buildVisibleWatermarkText(jobId: string, mode: WatermarkMode): string {
  return `Watermarkity ${mode.toUpperCase()} ${jobId.slice(-6)}`;
}

function getVisibleWatermarkOpacity(
  mode: WatermarkMode,
  requestedOpacity?: number,
): number {
  if (typeof requestedOpacity === "number") {
    return Math.max(0.08, Math.min(0.45, requestedOpacity));
  }

  if (mode === "forensic") return 0.28;
  if (mode === "balanced") return 0.22;
  return 0.16;
}

function applyVisibleWatermarkFallback(
  pixels: Uint8Array,
  width: number,
  height: number,
  opacity: number,
): void {
  const stripeGap = Math.max(18, Math.round(Math.min(width, height) * 0.06));
  const stripeWidth = Math.max(3, Math.round(stripeGap * 0.18));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const band = (x + y) % stripeGap;
      if (band > stripeWidth) continue;

      const idx = (y * width + x) * 3;
      pixels[idx] = clamp(pixels[idx] * (1 - opacity) + 255 * opacity);
      pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - opacity) + 255 * opacity);
      pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - opacity) + 255 * opacity);
    }
  }
}

function applyVisibleWatermarkOverlay(
  pixels: Uint8Array,
  width: number,
  height: number,
  text: string,
  mode: WatermarkMode,
  requestedOpacity?: number,
  forceFallbackOnly = false,
): void {
  const opacity = getVisibleWatermarkOpacity(mode, requestedOpacity);

  if (forceFallbackOnly || typeof OffscreenCanvas === "undefined") {
    applyVisibleWatermarkFallback(pixels, width, height, opacity);
    return;
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    applyVisibleWatermarkFallback(pixels, width, height, opacity);
    return;
  }

  const fontSize = Math.max(20, Math.round(Math.min(width, height) * 0.055));
  const tileX = Math.max(180, Math.round(fontSize * 5.2));
  const tileY = Math.max(120, Math.round(fontSize * 2.8));
  const strokeAlpha = Math.min(opacity + 0.12, 0.48);

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 5);
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(1.5, fontSize * 0.06);
  ctx.strokeStyle = `rgba(0, 0, 0, ${strokeAlpha})`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

  for (let y = -height; y <= height; y += tileY) {
    for (let x = -width; x <= width; x += tileX) {
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();

  const overlay = ctx.getImageData(0, 0, width, height).data;
  for (let i = 0, p = 0; i < overlay.length; i += 4, p += 3) {
    const alpha = overlay[i + 3] / 255;
    if (alpha === 0) continue;

    pixels[p] = clamp(pixels[p] * (1 - alpha) + overlay[i] * alpha);
    pixels[p + 1] = clamp(pixels[p + 1] * (1 - alpha) + overlay[i + 1] * alpha);
    pixels[p + 2] = clamp(pixels[p + 2] * (1 - alpha) + overlay[i + 2] * alpha);
  }
}

/* ================================================================
   Layer 0 — Pre-computed UAP Application
   
   Applies a Universal Adversarial Perturbation that was generated
   OFFLINE via gradient-based optimization against an ensemble of
   vision encoders (CLIP ViT-B/32, ViT-L/14, SigLIP, DINOv2).
   
   The UAP is tiled across the image with cosine-blended seams.
   Applied directly in RGB space (the UAP is already optimised
   in the right direction for CLIP/SigLIP disruption).
   ================================================================ */

function applyUAP(
  pixels: Uint8Array, // RGB, 3 bytes/pixel
  w: number,
  h: number,
  uapData: Int8Array,
  uapW: number,
  uapH: number,
  strength: number,
): void {
  // Cosine blending zone at tile edges (pixels)
  const blend = Math.min(16, Math.floor(Math.min(uapW, uapH) * 0.1));

  for (let y = 0; y < h; y++) {
    const uy = y % uapH;
    // Vertical blend factor at tile boundary
    const distY = Math.min(uy, uapH - 1 - uy);
    const blendY = distY < blend ? 0.5 + 0.5 * Math.cos(Math.PI * (1 - distY / blend)) : 1;

    for (let x = 0; x < w; x++) {
      const ux = x % uapW;
      const distX = Math.min(ux, uapW - 1 - ux);
      const blendX = distX < blend ? 0.5 + 0.5 * Math.cos(Math.PI * (1 - distX / blend)) : 1;

      const alpha = strength * blendX * blendY;
      const uIdx = (uy * uapW + ux) * 3;
      const pIdx = (y * w + x) * 3;

      pixels[pIdx] = clamp(pixels[pIdx] + uapData[uIdx] * alpha);
      pixels[pIdx + 1] = clamp(pixels[pIdx + 1] + uapData[uIdx + 1] * alpha);
      pixels[pIdx + 2] = clamp(pixels[pIdx + 2] + uapData[uIdx + 2] * alpha);
    }
  }
}

function normalizeUapLayers(
  uapLayers: UapLayerInput[] | null | undefined,
  fallbackData: Int8Array | null | undefined,
  fallbackWidth: number,
  fallbackHeight: number,
): UapLayerInput[] {
  const layers = (uapLayers ?? [])
    .filter((layer) => layer.data.length > 0 && layer.width > 0 && layer.height > 0)
    .slice(0, 3);

  if (layers.length > 0) {
    return layers;
  }

  if (fallbackData && fallbackData.length > 0) {
    return [
      {
        data: fallbackData,
        width: fallbackWidth,
        height: fallbackHeight,
        strength: 1,
        label: "general",
      },
    ];
  }

  return [];
}

function applyUapLayers(
  pixels: Uint8Array,
  width: number,
  height: number,
  layers: UapLayerInput[],
  totalStrength: number,
): string[] {
  const weightedLayers = layers.map((layer, index) => ({
    ...layer,
    weight: Math.max(0.05, layer.strength ?? 1),
    label: layer.label?.trim() || `uap-${index + 1}`,
  }));
  const totalWeight = weightedLayers.reduce((sum, layer) => sum + layer.weight, 0);

  if (!totalWeight) {
    return [];
  }

  for (const layer of weightedLayers) {
    applyUAP(
      pixels,
      width,
      height,
      layer.data,
      layer.width,
      layer.height,
      totalStrength * (layer.weight / totalWeight),
    );
  }

  return weightedLayers.map((layer) => layer.label);
}

/* ================================================================
   Layer 1 — ViT Patch-Correlated Perturbation with Perceptual Masking

   Why this works:
   ViTs split images into 14×14 patches and project each via a
   learned linear embedding.  Random per-pixel noise cancels out
   within the patch (√196 ≈ 14× weaker in embedding space).
   By applying a SINGLE perturbation vector to all 196 pixels in
   each patch, the full perturbation magnitude is preserved through
   the patch embedding — 14× more effective per epsilon unit.

   YCbCr weighting:
   Humans are 3-5× less sensitive to chroma (Cb/Cr) changes.
   We concentrate most of the perturbation budget in chroma so
   the image looks barely changed to humans while CLIP sees
   a strong signal across all channels.

   Perceptual masking:
   Perturbation is scaled per-patch based on local texture energy
   (Sobel edge magnitude) and luminance.  Textured regions (grass,
   fabric) tolerate ε = 24-32/255 invisibly; smooth regions (sky,
   skin) are kept at ε = 6-8/255.
   ================================================================ */

function computeLuminance(pixels: Uint8Array, w: number, h: number): Float32Array {
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    lum[i] = 0.299 * pixels[i * 3] + 0.587 * pixels[i * 3 + 1] + 0.114 * pixels[i * 3 + 2];
  }
  return lum;
}

function computeSobelEnergy(lum: Float32Array, w: number, h: number): Float32Array {
  const energy = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = lum[(y - 1) * w + x - 1];
      const tc = lum[(y - 1) * w + x];
      const tr = lum[(y - 1) * w + x + 1];
      const ml = lum[y * w + x - 1];
      const mr = lum[y * w + x + 1];
      const bl = lum[(y + 1) * w + x - 1];
      const bc = lum[(y + 1) * w + x];
      const br = lum[(y + 1) * w + x + 1];

      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;

      energy[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return energy;
}

function applyPatchCorrelatedPerturbation(
  pixels: Uint8Array, // RGB, 3ch
  w: number,
  h: number,
  seed: string,
  patchEpsilon: number,
  cbCrWeight: number,
  patchGridStep = 1,
): void {
  const rng = xorshift32(h32(seed + ":patch"));
  const lum = computeLuminance(pixels, w, h);
  const sobelEnergy = computeSobelEnergy(lum, w, h);

  const patchesX = Math.ceil(w / VIT_PATCH);
  const patchesY = Math.ceil(h / VIT_PATCH);

  for (let py = 0; py < patchesY; py += patchGridStep) {
    for (let px = 0; px < patchesX; px += patchGridStep) {
      const startX = px * VIT_PATCH;
      const startY = py * VIT_PATCH;
      const endX = Math.min(startX + VIT_PATCH * patchGridStep, w);
      const endY = Math.min(startY + VIT_PATCH * patchGridStep, h);

      // ── Compute per-patch texture energy & mean luminance ──
      let totalEdge = 0;
      let totalLum = 0;
      let count = 0;
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          totalEdge += sobelEnergy[y * w + x];
          totalLum += lum[y * w + x];
          count++;
        }
      }
      const avgEdge = totalEdge / count;
      const avgLum = totalLum / count;

      // ── Perceptual masking: compute local epsilon ──
      // Normalised texture (0 = smooth, 1 = very textured at edge=40+)
      const textureFactor = Math.min(avgEdge / 40, 1.0);
      // Dark / bright regions tolerate more perturbation
      const lumFactor = avgLum < 35 || avgLum > 220 ? 1.4 : 1.0;
      // Scale epsilon: smooth regions get 40% of base, textured up to 220%
      const localEps = patchEpsilon * (0.4 + 1.8 * textureFactor) * lumFactor;
      // Clamp to [30%..250%] of base
      const eps = Math.max(patchEpsilon * 0.3, Math.min(patchEpsilon * 2.5, localEps));

      // ── Generate perturbation in YCbCr space ──
      const rawY = (rng() / 0xffffffff) * 2 - 1; // [-1, 1]
      const rawCb = (rng() / 0xffffffff) * 2 - 1;
      const rawCr = (rng() / 0xffffffff) * 2 - 1;

      // Weighted: attenuate luminance, amplify chroma
      const dY = rawY * eps * (1 - cbCrWeight);
      const dCb = rawCb * eps * cbCrWeight * 1.2;
      const dCr = rawCr * eps * cbCrWeight * 1.0;

      // Convert YCbCr delta back to RGB delta
      const dR = dY + 1.402 * dCr;
      const dG = dY - 0.344 * dCb - 0.714 * dCr;
      const dB = dY + 1.772 * dCb;

      // ── Checkerboard sign at PATCH level (not pixel level!) ──
      // Alternating positive/negative perturbation across adjacent patches
      // disrupts inter-patch positional relationships in ViT attention
      const sign = ((px + py) % 2 === 0) ? 1 : -1;

      // ── Apply uniform perturbation to all pixels in this patch ──
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * w + x) * 3;
          pixels[idx] = clamp(pixels[idx] + sign * dR);
          pixels[idx + 1] = clamp(pixels[idx + 1] + sign * dG);
          pixels[idx + 2] = clamp(pixels[idx + 2] + sign * dB);
        }
      }
    }
  }
}

/* ================================================================
   Layer 2 — DCT Mid-Frequency Coefficient Perturbation

   ViTs rely heavily on low-to-mid frequency features (4-32 cycles
   per image dimension).  High-frequency noise (the old checkerboard
   pattern) is the LEAST effective — it's destroyed by any
   downsampling and averages out inside patches.

   This layer targets DCT coefficients 5-20 in zig-zag order (the
   mid-frequency band), which:
   • Survive JPEG compression at Q≥75
   • Have HIGH impact on ViT feature extraction
   • Have LOW human visibility (perceptual masking)

   Implementation: separable 8×8 DCT-II / IDCT-III.
   ================================================================ */

// Pre-computed cosine table: DCT_COS[k][n] = cos(π(2n+1)k / 16)
const DCT_COS: number[][] = [];
for (let k = 0; k < 8; k++) {
  DCT_COS[k] = [];
  for (let n = 0; n < 8; n++) {
    DCT_COS[k][n] = Math.cos(Math.PI * (2 * n + 1) * k / 16);
  }
}
// Normalisation: C[0] = 1/√2, C[k>0] = 1
const DCT_C = [1 / Math.SQRT2, 1, 1, 1, 1, 1, 1, 1];

// Zig-zag scan order for 8×8 block: [zig_index] → [row, col]
const ZIGZAG: [number, number][] = [
  [0, 0], [0, 1], [1, 0], [2, 0], [1, 1], [0, 2], [0, 3], [1, 2],
  [2, 1], [3, 0], [4, 0], [3, 1], [2, 2], [1, 3], [0, 4], [0, 5],
  [1, 4], [2, 3], [3, 2], [4, 1], [5, 0], [6, 0], [5, 1], [4, 2],
  [3, 3], [2, 4], [1, 5], [0, 6], [0, 7], [1, 6], [2, 5], [3, 4],
  [4, 3], [5, 2], [6, 1], [7, 0], [7, 1], [6, 2], [5, 3], [4, 4],
  [3, 5], [2, 6], [1, 7], [2, 7], [3, 6], [4, 5], [5, 4], [6, 3],
  [7, 2], [7, 3], [6, 4], [5, 5], [4, 6], [3, 7], [4, 7], [5, 6],
  [6, 5], [7, 4], [7, 5], [6, 6], [5, 7], [6, 7], [7, 6], [7, 7],
];

/** Orthogonal 2D DCT-II on an 8×8 block (in-place) */
function dct2d(block: Float32Array, temp: Float32Array): void {

  // Forward DCT on each row
  for (let r = 0; r < 8; r++) {
    for (let k = 0; k < 8; k++) {
      let sum = 0;
      for (let n = 0; n < 8; n++) {
        sum += block[r * 8 + n] * DCT_COS[k][n];
      }
      temp[r * 8 + k] = 0.5 * DCT_C[k] * sum;
    }
  }

  // Forward DCT on each column
  for (let c = 0; c < 8; c++) {
    for (let k = 0; k < 8; k++) {
      let sum = 0;
      for (let n = 0; n < 8; n++) {
        sum += temp[n * 8 + c] * DCT_COS[k][n];
      }
      block[k * 8 + c] = 0.5 * DCT_C[k] * sum;
    }
  }
}

/** Orthogonal 2D IDCT-III on an 8×8 block (in-place) */
function idct2d(block: Float32Array, temp: Float32Array): void {

  // Inverse DCT on each column
  for (let c = 0; c < 8; c++) {
    for (let x = 0; x < 8; x++) {
      let sum = 0;
      for (let k = 0; k < 8; k++) {
        sum += DCT_C[k] * block[k * 8 + c] * DCT_COS[k][x];
      }
      temp[x * 8 + c] = 0.5 * sum;
    }
  }

  // Inverse DCT on each row
  for (let r = 0; r < 8; r++) {
    for (let x = 0; x < 8; x++) {
      let sum = 0;
      for (let k = 0; k < 8; k++) {
        sum += DCT_C[k] * temp[r * 8 + k] * DCT_COS[k][x];
      }
      block[r * 8 + x] = 0.5 * sum;
    }
  }
}

function applyDCTMidFrequencyPerturbation(
  pixels: Uint8Array,
  w: number,
  h: number,
  seed: string,
  dctAlpha: number,
  runtimeProfile: ReturnType<typeof getClientRuntimeProfile>,
): void {
  const rng = xorshift32(h32(seed + ":dct"));
  const block = new Float32Array(64);
  const dctTemp = new Float32Array(64);
  const idctTemp = new Float32Array(64);
  const channels = runtimeProfile.dctChannels;
  const blockStep = runtimeProfile.dctBlockStep;
  const alphaBoost = blockStep > 1 ? 1.25 : 1;
  const effectiveAlpha = dctAlpha * alphaBoost;

  const blocksX = Math.floor(w / BLOCK);
  const blocksY = Math.floor(h / BLOCK);

  // Target zig-zag positions 5–20 (mid-frequency band)
  const MID_FREQ_START = 5;
  const MID_FREQ_END = 20;

  for (let by = 0; by < blocksY; by += blockStep) {
    for (let bx = 0; bx < blocksX; bx += blockStep) {
      for (const ch of channels) {
        // Extract 8×8 block for this channel
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const px = bx * BLOCK + c;
            const py = by * BLOCK + r;
            block[r * 8 + c] = pixels[(py * w + px) * 3 + ch];
          }
        }

        // Forward DCT
        dct2d(block, dctTemp);

        // Perturb mid-frequency coefficients
        for (let zi = MID_FREQ_START; zi <= MID_FREQ_END; zi++) {
          const sign = (rng() & 1) === 0 ? 1 : -1;
          const [r, c] = ZIGZAG[zi];
          block[r * 8 + c] *= 1 + sign * effectiveAlpha;
        }

        // Inverse DCT
        idct2d(block, idctTemp);

        // Write back, clamped
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const px = bx * BLOCK + c;
            const py = by * BLOCK + r;
            pixels[(py * w + px) * 3 + ch] = clamp(block[r * 8 + c]);
          }
        }
      }
    }
  }
}

/* ================================================================
   Layer 3 — Chromatic Aberration Injection

   Shifts R and B channels spatially by a few pixels in opposite
   directions.  Imperceptible at normal viewing distance but
   disrupts the cross-channel spatial coherence CLIP relies on.

   Also applies subtle Cb/Cr quantisation (reduce to 6-bit) which
   further disrupts chroma-dependent feature extraction.
   ================================================================ */

function applyChromaticAberration(
  pixels: Uint8Array,
  w: number,
  h: number,
  seed: string,
  shiftPx: number,
): void {
  if (shiftPx < 1) return;

  const rng = xorshift32(h32(seed + ":chroma"));
  // Random direction for the aberration
  const angle = (rng() / 0xffffffff) * Math.PI * 2;
  const dx = Math.round(Math.cos(angle) * shiftPx);
  const dy = Math.round(Math.sin(angle) * shiftPx);

  // We need a copy of the original for reading
  const original = new Uint8Array(pixels);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;

      // Shift RED channel by (+dx, +dy)
      const rxR = Math.min(w - 1, Math.max(0, x - dx));
      const ryR = Math.min(h - 1, Math.max(0, y - dy));
      pixels[idx] = original[(ryR * w + rxR) * 3];

      // GREEN channel stays at original position (reference)
      // pixels[idx + 1] unchanged

      // Shift BLUE channel by (-dx, -dy)
      const rxB = Math.min(w - 1, Math.max(0, x + dx));
      const ryB = Math.min(h - 1, Math.max(0, y + dy));
      pixels[idx + 2] = original[(ryB * w + rxB) * 3 + 2];

      // Subtle Cb/Cr quantisation: reduce chroma precision to ~6 bits
      // This rounds chroma to multiples of 4, removing fine chroma detail
      // that CLIP uses for material/texture recognition
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // Quick approximate: quantise B-Y and R-Y differences
      const cb = b - g;
      const cr = r - g;
      const qCb = Math.round(cb / 4) * 4;
      const qCr = Math.round(cr / 4) * 4;

      pixels[idx] = clamp(g + qCr);       // R
      pixels[idx + 2] = clamp(g + qCb);   // B
      // G stays unchanged
    }
  }
}

/* ================================================================
   Layer 4 — Block-Average QIM Watermark (JPEG-resilient)

   Quantisation Index Modulation on the average of 8×8 pixel blocks.
   JPEG preserves DC (block average) extremely well, giving 89-100%
   accuracy through Q93 compression + adversarial perturbation.

   This layer is for VERIFICATION, not anti-AI.
   ================================================================ */

type BlockPos = { bx: number; by: number; ch: number };

function chooseBlocks(
  w: number,
  h: number,
  count: number,
  seedText: string,
): BlockPos[] {
  const rng = xorshift32(h32(seedText));
  const blocksX = Math.floor(w / BLOCK);
  const blocksY = Math.floor(h / BLOCK);
  const totalSlots = blocksX * blocksY * 3; // ×3 for RGB channels

  const used = new Set<number>();
  const result: BlockPos[] = [];

  while (result.length < count && used.size < totalSlots) {
    const idx = rng() % totalSlots;
    if (!used.has(idx)) {
      used.add(idx);
      const ch = idx % 3;
      const blockIdx = Math.floor(idx / 3);
      const bx = (blockIdx % blocksX) * BLOCK;
      const by = Math.floor(blockIdx / blocksX) * BLOCK;
      result.push({ bx, by, ch });
    }
  }
  return result;
}

function bytesToBitString(input: Uint8Array): string {
  return Array.from(input)
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join("");
}

function bitStringToBytes(bits: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8).padEnd(8, "0"), 2));
  }
  return new Uint8Array(bytes);
}

type PayloadCodec = "raw" | "h74";

function encodeHamming74Nibble(nibbleBits: string): string {
  const padded = nibbleBits.padEnd(4, "0");
  const d1 = padded[0] === "1" ? 1 : 0;
  const d2 = padded[1] === "1" ? 1 : 0;
  const d3 = padded[2] === "1" ? 1 : 0;
  const d4 = padded[3] === "1" ? 1 : 0;
  const p1 = d1 ^ d2 ^ d4;
  const p2 = d1 ^ d3 ^ d4;
  const p3 = d2 ^ d3 ^ d4;
  return `${p1}${p2}${d1}${p3}${d2}${d3}${d4}`;
}

function decodeHamming74Nibble(encodedBits: string): string {
  const bits = encodedBits.padEnd(7, "0").split("").map((bit) => (bit === "1" ? 1 : 0));

  const s1 = bits[0] ^ bits[2] ^ bits[4] ^ bits[6];
  const s2 = bits[1] ^ bits[2] ^ bits[5] ^ bits[6];
  const s3 = bits[3] ^ bits[4] ^ bits[5] ^ bits[6];
  const errorPosition = s1 + (s2 << 1) + (s3 << 2);

  if (errorPosition >= 1 && errorPosition <= 7) {
    bits[errorPosition - 1] ^= 1;
  }

  return `${bits[2]}${bits[4]}${bits[5]}${bits[6]}`;
}

function encodePayloadBits(rawBits: string, codec: PayloadCodec): string {
  if (codec === "raw") {
    return rawBits;
  }

  let encoded = "";
  for (let i = 0; i < rawBits.length; i += 4) {
    encoded += encodeHamming74Nibble(rawBits.slice(i, i + 4));
  }
  return encoded;
}

function decodePayloadBits(encodedBits: string, rawBitLength: number, codec: PayloadCodec): string {
  if (codec === "raw") {
    return encodedBits.slice(0, rawBitLength);
  }

  let decoded = "";
  for (let i = 0; i < encodedBits.length; i += 7) {
    decoded += decodeHamming74Nibble(encodedBits.slice(i, i + 7));
  }

  return decoded.slice(0, rawBitLength);
}

function choosePayloadCodec(rawBitLength: number, totalBlockSlots: number): PayloadCodec {
  const h74BitLength = Math.ceil(rawBitLength / 4) * 7;
  return totalBlockSlots >= h74BitLength ? "h74" : "raw";
}

function qimEmbed(value: number, bit: number, delta: number): number {
  const half = delta / 2;
  if (bit === 0) {
    return clamp(Math.round(value / delta) * delta);
  } else {
    return clamp(Math.round(Math.round((value - half) / delta) * delta + half));
  }
}

function qimDecode(value: number, delta: number): number {
  const half = delta / 2;
  const d0 = Math.abs(value - Math.round(value / delta) * delta);
  const d1 = Math.abs(value - (Math.round((value - half) / delta) * delta + half));
  return d0 <= d1 ? 0 : 1;
}

function embedQIM(
  pixels: Uint8Array, // RGB, 3ch
  w: number,
  h: number,
  payloadBits: string,
  repeatFactor: number,
  qimDelta: number,
  seedText: string,
): void {
  const neededBlocks = payloadBits.length * repeatFactor;
  const blocks = chooseBlocks(w, h, neededBlocks, seedText);
  const stride = 3;

  for (let bitIndex = 0; bitIndex < payloadBits.length; bitIndex++) {
    const bit = payloadBits[bitIndex] === "1" ? 1 : 0;

    for (let rep = 0; rep < repeatFactor; rep++) {
      const posIdx = bitIndex * repeatFactor + rep;
      if (posIdx >= blocks.length) break;
      const { bx, by, ch } = blocks[posIdx];

      // Compute block average for this channel
      let sum = 0;
      for (let dy = 0; dy < BLOCK; dy++) {
        for (let dx = 0; dx < BLOCK; dx++) {
          sum += pixels[((by + dy) * w + (bx + dx)) * stride + ch];
        }
      }
      const avg = sum / BLOCK_PX;
      const target = qimEmbed(Math.round(avg), bit, qimDelta);
      const shift = target - Math.round(avg);

      if (shift !== 0) {
        for (let dy = 0; dy < BLOCK; dy++) {
          for (let dx = 0; dx < BLOCK; dx++) {
            const idx = ((by + dy) * w + (bx + dx)) * stride + ch;
            pixels[idx] = clamp(pixels[idx] + shift);
          }
        }
      }
    }
  }
}

/* ================================================================
   QIM Verification (direct accuracy — no recompression test)
   ================================================================ */

function decodeQIM(
  pixels: Uint8Array, // RGB, 3ch
  w: number,
  h: number,
  encodedBitLength: number,
  rawBitLength: number,
  repeatFactor: number,
  qimDelta: number,
  seedText: string,
  expectedPayload: string,
  payloadCodec: PayloadCodec,
  cropPx = 0,
): { bitAccuracy: number; detected: boolean; recoveredPayload: string } {
  const neededBlocks = encodedBitLength * repeatFactor;

  const blocksX = Math.floor(w / BLOCK);
  const blocksY = Math.floor(h / BLOCK);
  const totalBlockSlots = blocksX * blocksY * 3;

  if (totalBlockSlots < neededBlocks) {
    return { bitAccuracy: 0, detected: false, recoveredPayload: "" };
  }

  const blocks = chooseBlocks(w, h, neededBlocks, seedText);
  const decodedBits: string[] = [];
  const stride = 3;
  const innerWidth = w - cropPx * 2;
  const innerHeight = h - cropPx * 2;
  const useCropCompensation = cropPx > 0 && innerWidth >= BLOCK && innerHeight >= BLOCK;
  const scaleX = useCropCompensation ? w / innerWidth : 1;
  const scaleY = useCropCompensation ? h / innerHeight : 1;

  const readBlockAverage = (bx: number, by: number, ch: number) => {
    let sum = 0;

    for (let dy = 0; dy < BLOCK; dy++) {
      for (let dx = 0; dx < BLOCK; dx++) {
        let sampleX = bx + dx;
        let sampleY = by + dy;

        if (useCropCompensation) {
          sampleX = Math.round((sampleX - cropPx) * scaleX);
          sampleY = Math.round((sampleY - cropPx) * scaleY);
        }

        const clampedX = Math.min(w - 1, Math.max(0, sampleX));
        const clampedY = Math.min(h - 1, Math.max(0, sampleY));
        sum += pixels[(clampedY * w + clampedX) * stride + ch];
      }
    }

    return sum / BLOCK_PX;
  };

  for (let bitIndex = 0; bitIndex < encodedBitLength; bitIndex++) {
    let votes0 = 0;
    let votes1 = 0;

    for (let rep = 0; rep < repeatFactor; rep++) {
      const posIdx = bitIndex * repeatFactor + rep;
      if (posIdx >= blocks.length) break;
      const { bx, by, ch } = blocks[posIdx];

      const avg = readBlockAverage(bx, by, ch);
      const decoded = qimDecode(Math.round(avg), qimDelta);
      if (decoded === 0) votes0++;
      else votes1++;
    }
    decodedBits.push(votes1 > votes0 ? "1" : "0");
  }

  const decodedPayloadBits = decodePayloadBits(decodedBits.join(""), rawBitLength, payloadCodec);

  const recoveredPayload = new TextDecoder().decode(
    bitStringToBytes(decodedPayloadBits)
  ).replace(/\0+$/g, "");

  const expectedBits = bytesToBitString(new TextEncoder().encode(expectedPayload));
  const recoveredBitStr = decodedPayloadBits.slice(0, expectedBits.length);

  let matched = 0;
  for (let i = 0; i < expectedBits.length; i++) {
    if (expectedBits[i] === recoveredBitStr[i]) matched++;
  }

  const bitAccuracy = expectedBits.length ? matched / expectedBits.length : 0;
  const detected = recoveredPayload === expectedPayload || bitAccuracy >= 0.9;

  return { bitAccuracy, detected, recoveredPayload };
}

export function verifyWatermark(input: VerifyInput): VerifyResult {
  const {
    rgbaPixels,
    width,
    height,
    jobId,
    mode,
    payload,
    repeatFactor,
    protectionProfile = "hybrid",
  } = input;

  const cfg = modeConfig(mode);
  const pixelCount = width * height;
  const runtimeProfile = getClientRuntimeProfile(pixelCount);
  const rawPayloadBits = bytesToBitString(new TextEncoder().encode(payload));
  const blocksX = Math.floor(width / BLOCK);
  const blocksY = Math.floor(height / BLOCK);
  const totalBlockSlots = blocksX * blocksY * 3;
  const payloadCodec = choosePayloadCodec(rawPayloadBits.length, totalBlockSlots);
  const payloadBits = encodePayloadBits(rawPayloadBits, payloadCodec);
  const maxRepeat = Math.max(1, Math.floor(totalBlockSlots / payloadBits.length));
  const actualRepeat = repeatFactor
    ? Math.max(1, Math.min(repeatFactor, maxRepeat))
    : Math.min(cfg.repeatFactor, maxRepeat, runtimeProfile.repeatCap);
  const rgb = rgbaToRgb(rgbaPixels, pixelCount);
  const qimSeed = `${jobId}:${mode}:embed`;

  const cropCandidates = [0];
  const maxCropCompensation = Math.min(8, Math.floor(Math.min(width, height) * 0.03));
  for (let cropPx = 2; cropPx <= maxCropCompensation; cropPx += 2) {
    cropCandidates.push(cropPx);
  }

  let bestVerification = decodeQIM(
    rgb,
    width,
    height,
    payloadBits.length,
    rawPayloadBits.length,
    actualRepeat,
    cfg.qimDelta,
    qimSeed,
    payload,
    payloadCodec,
    0,
  );

  for (let index = 1; index < cropCandidates.length; index++) {
    const candidate = decodeQIM(
      rgb,
      width,
      height,
      payloadBits.length,
      rawPayloadBits.length,
      actualRepeat,
      cfg.qimDelta,
      qimSeed,
      payload,
      payloadCodec,
      cropCandidates[index],
    );

    if (candidate.bitAccuracy > bestVerification.bitAccuracy) {
      bestVerification = candidate;
    }
  }

  const { bitAccuracy, detected, recoveredPayload } = bestVerification;

  return {
    detector: protectionProfile !== "invisible"
      ? `hybrid_visible_qim_${payloadCodec}_v5`
      : `adversarial_qim_${payloadCodec}_v5`,
    confidence: Number((bitAccuracy * 0.7 + (detected ? 0.3 : 0)).toFixed(4)),
    watermarkId: payload,
    directAccuracy: Number(bitAccuracy.toFixed(4)),
    recoveredPayload,
    repeatFactor: actualRepeat,
    detected,
    payloadCodec,
  };
}

/* ================================================================
   Main: processWatermark
   ================================================================ */

export async function processWatermark(input: ProcessInput): Promise<ProcessResult> {
  const {
    rgbaPixels,
    width,
    height,
    jobId,
    mode,
    protectionProfile = "hybrid",
    visibleWatermark,
    uapData,
    uapLayers,
    uapWidth = 224,
    uapHeight = 224,
    onProgress,
  } = input;

  const cfg = modeConfig(mode);
  const payload = buildPayload(jobId, mode);
  const rawPayloadBits = bytesToBitString(new TextEncoder().encode(payload));
  const seed = `${jobId}:${mode}`;
  const pixelCount = width * height;
  const runtimeProfile = getClientRuntimeProfile(pixelCount);
  const runAdversarialLayers = protectionProfile !== "visible";
  const resolvedUapLayers = normalizeUapLayers(uapLayers, uapData, uapWidth, uapHeight);
  const visibleEnabled = protectionProfile !== "invisible" && visibleWatermark?.enabled !== false;
  const visibleText = visibleEnabled
    ? (visibleWatermark?.text?.trim() || buildVisibleWatermarkText(jobId, mode))
    : "";

  const progress = onProgress ?? (() => {});

  // Convert RGBA → RGB for processing
  progress("prepare", 0);
  const rgb = rgbaToRgb(rgbaPixels, pixelCount);

  // ═══ Layer 0: UAP Application (if available) ═══
  if (runAdversarialLayers && resolvedUapLayers.length > 0) {
    progress("uap", 0);
    applyUapLayers(rgb, width, height, resolvedUapLayers, cfg.uapStrength);
    progress("uap", 100);
  }

  // ═══ Layer 1: Patch-Correlated Perturbation ═══
  if (runAdversarialLayers) {
    progress("patch", 0);
    applyPatchCorrelatedPerturbation(
      rgb, width, height, seed, cfg.patchEpsilon, cfg.cbCrWeight, runtimeProfile.patchGridStep,
    );
    progress("patch", 100);
  }

  // ═══ Layer 2: DCT Mid-Frequency Perturbation ═══
  if (runAdversarialLayers) {
    progress("dct", 0);
    if (!runtimeProfile.skipDct) {
      applyDCTMidFrequencyPerturbation(
        rgb,
        width,
        height,
        seed,
        cfg.dctAlpha,
        runtimeProfile,
      );
    }
    progress("dct", 100);
  }

  // ═══ Layer 3: Chromatic Aberration ═══
  if (runAdversarialLayers) {
    progress("chroma", 0);
    applyChromaticAberration(
      rgb,
      width,
      height,
      seed,
      runtimeProfile.chromaShiftOverride ?? cfg.chromaShiftPx,
    );
    progress("chroma", 100);
  }

  if (visibleEnabled) {
    progress("visible", 0);
    applyVisibleWatermarkOverlay(
      rgb,
      width,
      height,
      visibleText,
      mode,
      visibleWatermark?.opacity,
      runtimeProfile.preferVisibleFallback,
    );
    progress("visible", 100);
  }

  // ═══ Layer 4: Block-Average QIM Watermark ═══
  progress("qim", 0);

  // Check capacity — cap repeatFactor to available blocks
  const blocksX = Math.floor(width / BLOCK);
  const blocksY = Math.floor(height / BLOCK);
  const totalBlockSlots = blocksX * blocksY * 3;
  const payloadCodec = choosePayloadCodec(rawPayloadBits.length, totalBlockSlots);
  const payloadBits = encodePayloadBits(rawPayloadBits, payloadCodec);
  const maxRepeat = Math.max(1, Math.floor(totalBlockSlots / payloadBits.length));
  const actualRepeat = Math.min(cfg.repeatFactor, maxRepeat, runtimeProfile.repeatCap);

  const qimSeed = `${jobId}:${mode}:embed`;
  embedQIM(rgb, width, height, payloadBits, actualRepeat, cfg.qimDelta, qimSeed);
  progress("qim", 100);

  // ═══ Verification (direct decode) ═══
  progress("verify", 0);
  const { bitAccuracy, detected } = decodeQIM(
    rgb, width, height,
    payloadBits.length, rawPayloadBits.length,
    actualRepeat,
    cfg.qimDelta, qimSeed, payload, payloadCodec,
  );
  progress("verify", 100);

  // Convert back to RGBA
  const outputRgba = rgbToRgba(rgb, pixelCount);

  return {
    rgbaPixels: outputRgba,
    width,
    height,
    payload,
    repeatFactor: actualRepeat,
    mode,
    protectionProfile,
    verification: {
      detector: visibleEnabled
        ? `hybrid_visible_qim_${payloadCodec}_v5`
        : `adversarial_qim_${payloadCodec}_v5`,
      confidence: Number((bitAccuracy * 0.7 + (detected ? 0.3 : 0)).toFixed(4)),
      watermarkId: payload,
      directAccuracy: Number(bitAccuracy.toFixed(4)),
    },
    visibleWatermark: {
      enabled: visibleEnabled,
      text: visibleEnabled ? visibleText : null,
    },
    uapProfile: {
      strategy: resolvedUapLayers.length > 1 ? "ensemble" : resolvedUapLayers.length === 1 ? "single" : "none",
      layers: resolvedUapLayers.map((layer, index) => layer.label?.trim() || `uap-${index + 1}`),
    },
  };
}
