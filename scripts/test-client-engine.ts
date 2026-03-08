/**
 * Standalone test for the client-engine v3.
 * Verifies: round-trip QIM accuracy, pixel modification, format correctness.
 *
 * Usage: npx tsx scripts/test-client-engine.ts
 */

import {
  processWatermark,
  verifyWatermark,
  type UapLayerInput,
  type WatermarkMode,
} from "../src/lib/watermarkity/client-engine";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

// Create a synthetic RGBA test image (256×256, gradient)
function createTestImage(w: number, h: number): Uint8Array {
  const rgba = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      rgba[i] = Math.round((x / w) * 255);     // R: horizontal gradient
      rgba[i + 1] = Math.round((y / h) * 255);  // G: vertical gradient
      rgba[i + 2] = 128;                         // B: constant
      rgba[i + 3] = 255;                         // A: opaque
    }
  }
  return rgba;
}

// Load a UAP file
function loadUAP(category: string): Int8Array | null {
  try {
    const buf = readFileSync(join(process.cwd(), "public", "uaps", `${category}.bin`));
    return new Int8Array(buf.buffer, buf.byteOffset, buf.length);
  } catch {
    return null;
  }
}

function loadUapLayers(categories: string[]): UapLayerInput[] {
  const layers: UapLayerInput[] = [];

  for (const category of categories) {
    const data = loadUAP(category);
    if (!data) continue;
    layers.push({
      data,
      width: 224,
      height: 224,
      strength: 1,
      label: category,
    });
  }

  return layers;
}

// Compute PSNR between two RGBA images
function computePSNR(a: Uint8Array, b: Uint8Array): number {
  let mse = 0;
  let count = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      const diff = a[i + ch] - b[i + ch];
      mse += diff * diff;
      count++;
    }
  }
  mse /= count;
  if (mse === 0) return Infinity;
  return 10 * Math.log10(255 * 255 / mse);
}

async function runTest(mode: WatermarkMode) {
  const w = 256;
  const h = 256;
  const originalRgba = createTestImage(w, h);
  const inputRgba = new Uint8Array(originalRgba); // clone since engine modifies

  const uapData = loadUAP("general");
  const uapLayers = mode === "balanced"
    ? loadUapLayers(["general", "urban", "product"])
    : mode === "forensic"
      ? loadUapLayers(["general", "text", "abstract"])
      : loadUapLayers(["general"]);
  const jobId = "test-" + Math.random().toString(36).slice(2, 10);

  console.log(`\n═══ Testing mode: ${mode} ═══`);
  console.log(`  Image: ${w}×${h}, UAP layers: ${uapLayers.length || (uapData ? 1 : 0)}`);

  const t0 = performance.now();
  const result = await processWatermark({
    rgbaPixels: inputRgba,
    width: w,
    height: h,
    jobId,
    mode,
    uapData,
    uapLayers,
    uapWidth: 224,
    uapHeight: 224,
    onProgress(layer, pct) {
      // silent for test
    },
  });
  const elapsed = performance.now() - t0;

  // Checks
  const psnr = computePSNR(originalRgba, result.rgbaPixels);

  console.log(`  Time: ${elapsed.toFixed(0)}ms`);
  console.log(`  Payload: ${result.payload}`);
  console.log(`  PSNR: ${psnr.toFixed(2)} dB`);
  console.log(`  Verification:`);
  console.log(`    Detector: ${result.verification.detector}`);
  console.log(`    Confidence: ${(result.verification.confidence * 100).toFixed(2)}%`);
  console.log(`    Direct Accuracy: ${(result.verification.directAccuracy * 100).toFixed(2)}%`);
  console.log(`    Watermark ID: ${result.verification.watermarkId}`);
  console.log(`  UAP profile: ${result.uapProfile.strategy} (${result.uapProfile.layers.join(", ") || "none"})`);
  console.log(`  Output size: ${result.rgbaPixels.length} bytes (RGBA)`);

  // Assertions
  let pass = true;
  if (result.verification.directAccuracy < 0.85) {
    console.log(`  ❌ FAIL: Direct accuracy ${result.verification.directAccuracy} < 0.85`);
    pass = false;
  }
  if (result.payload !== result.verification.watermarkId) {
    console.log(`  ❌ FAIL: Payload mismatch`);
    pass = false;
  }
  if (uapLayers.length > 1 && result.uapProfile.strategy !== "ensemble") {
    console.log(`  ❌ FAIL: Expected ensemble UAP strategy`);
    pass = false;
  }
  if (uapLayers.length === 1 && result.uapProfile.strategy !== "single") {
    console.log(`  ❌ FAIL: Expected single UAP strategy`);
    pass = false;
  }
  // PSNR thresholds per mode (anti-AI watermarks are intentionally visible):
  //   robust: 25 dB (subtle), balanced: 20 dB (noticeable), forensic: 15 dB (aggressive)
  const psnrMin = mode === "robust" ? 24.5 : mode === "balanced" ? 20 : 15;
  if (psnr < psnrMin) {
    console.log(`  ❌ FAIL: PSNR ${psnr.toFixed(2)} dB too low (< ${psnrMin} dB for ${mode})`);
    pass = false;
  }
  if (psnr === Infinity) {
    console.log(`  ❌ FAIL: No pixel modifications detected`);
    pass = false;
  }
  if (result.rgbaPixels.length !== w * h * 4) {
    console.log(`  ❌ FAIL: Output size mismatch`);
    pass = false;
  }
  if (pass) {
    console.log(`  ✅ PASS`);
  }
  return pass;
}

async function recompressAsJpeg(
  rgba: Uint8Array,
  width: number,
  height: number,
  quality: number,
): Promise<Uint8Array> {
  const encoded = await sharp(Buffer.from(rgba), {
    raw: { width, height, channels: 4 },
  }).jpeg({ quality }).toBuffer();
  const { data } = await sharp(encoded)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return new Uint8Array(data.buffer, data.byteOffset, data.length);
}

async function resizeRoundTrip(
  rgba: Uint8Array,
  width: number,
  height: number,
  targetWidth: number,
  targetHeight: number,
): Promise<Uint8Array> {
  const { data } = await sharp(Buffer.from(rgba), {
    raw: { width, height, channels: 4 },
  })
    .resize(targetWidth, targetHeight)
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return new Uint8Array(data.buffer, data.byteOffset, data.length);
}

async function cropRoundTrip(
  rgba: Uint8Array,
  width: number,
  height: number,
  cropPx: number,
): Promise<Uint8Array> {
  const { data } = await sharp(Buffer.from(rgba), {
    raw: { width, height, channels: 4 },
  })
    .extract({
      left: cropPx,
      top: cropPx,
      width: width - cropPx * 2,
      height: height - cropPx * 2,
    })
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return new Uint8Array(data.buffer, data.byteOffset, data.length);
}

async function runDegradationRegressionTest() {
  const width = 256;
  const height = 256;
  const mode: WatermarkMode = "balanced";
  const jobId = "degrade-" + Math.random().toString(36).slice(2, 10);
  const originalRgba = createTestImage(width, height);
  const watermarked = await processWatermark({
    rgbaPixels: new Uint8Array(originalRgba),
    width,
    height,
    jobId,
    mode,
    uapLayers: loadUapLayers(["general", "urban", "product"]),
    uapWidth: 224,
    uapHeight: 224,
  });

  const scenarios = [
    {
      label: "JPEG recompression q82",
      data: await recompressAsJpeg(watermarked.rgbaPixels, width, height, 82),
      minAccuracy: 0.95,
    },
    {
      label: "Resize 256 -> 224 -> 256",
      data: await resizeRoundTrip(watermarked.rgbaPixels, width, height, 224, 224),
      minAccuracy: 0.85,
    },
    {
      label: "Crop 4px border then restore",
      data: await cropRoundTrip(watermarked.rgbaPixels, width, height, 4),
      minAccuracy: 0.7,
    },
  ];

  console.log(`\n═══ Testing degradation resilience ═══`);
  console.log(`  Base payload: ${watermarked.payload}`);

  let pass = true;

  for (const scenario of scenarios) {
    const verification = verifyWatermark({
      rgbaPixels: scenario.data,
      width,
      height,
      jobId,
      mode,
      payload: watermarked.payload,
      repeatFactor: watermarked.repeatFactor,
    });

    console.log(`  ${scenario.label}: ${(verification.directAccuracy * 100).toFixed(2)}% accuracy, detected=${verification.detected}`);

    if (verification.directAccuracy < scenario.minAccuracy) {
      console.log(`  ❌ FAIL: ${scenario.label} accuracy ${verification.directAccuracy.toFixed(4)} < ${scenario.minAccuracy}`);
      pass = false;
    }
  }

  if (pass) {
    console.log(`  ✅ PASS`);
  }

  return pass;
}

async function runSmallImageFallbackTest() {
  const w = 96;
  const h = 96;
  const originalRgba = createTestImage(w, h);
  const inputRgba = new Uint8Array(originalRgba);
  const uapLayers = loadUapLayers(["general"]);
  const jobId = "tiny-" + Math.random().toString(36).slice(2, 10);

  console.log(`\n═══ Testing small-image fallback ═══`);
  console.log(`  Image: ${w}×${h}, target: raw payload fallback`);

  const result = await processWatermark({
    rgbaPixels: inputRgba,
    width: w,
    height: h,
    jobId,
    mode: "robust",
    uapLayers,
    uapWidth: 224,
    uapHeight: 224,
  });

  let pass = true;
  if (!result.verification.detector.includes("_raw_")) {
    console.log(`  ❌ FAIL: Expected raw payload fallback, got ${result.verification.detector}`);
    pass = false;
  }
  if (result.verification.directAccuracy < 0.85) {
    console.log(`  ❌ FAIL: Direct accuracy ${result.verification.directAccuracy} < 0.85`);
    pass = false;
  }
  if (result.payload !== result.verification.watermarkId) {
    console.log(`  ❌ FAIL: Payload mismatch`);
    pass = false;
  }
  if (pass) {
    console.log(`  ✅ PASS`);
  }

  return pass;
}

async function main() {
  console.log("Watermarkity Client Engine v3 — Test Suite");
  console.log("==========================================");

  const modes: WatermarkMode[] = ["robust", "balanced", "forensic"];
  let allPassed = true;

  for (const mode of modes) {
    const passed = await runTest(mode);
    if (!passed) allPassed = false;
  }

  const degradationPassed = await runDegradationRegressionTest();
  if (!degradationPassed) allPassed = false;

  const fallbackPassed = await runSmallImageFallbackTest();
  if (!fallbackPassed) allPassed = false;

  console.log("\n==========================================");
  if (allPassed) {
    console.log("All tests PASSED ✅");
  } else {
    console.log("Some tests FAILED ❌");
    process.exit(1);
  }
}

main();
