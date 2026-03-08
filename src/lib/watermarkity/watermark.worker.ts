/**
 * Watermarkity Web Worker — off-main-thread image processing.
 *
 * Message protocol:
 *   Main → Worker:  { type: 'process', rgbaPixels, width, height, jobId, mode, uapData?, uapWidth?, uapHeight? }
 *   Worker → Main:  { type: 'progress', layer, percent }
 *   Worker → Main:  { type: 'result', rgbaPixels, width, height, payload, repeatFactor, mode, verification }
 *   Worker → Main:  { type: 'error', message }
 *
 * The rgbaPixels ArrayBuffer is TRANSFERRED (zero-copy) in both directions.
 */

/// <reference lib="webworker" />

import {
  processWatermark,
  type ProtectionProfile,
  type VisibleWatermarkOptions,
  type WatermarkMode,
} from "./client-engine";

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;

workerScope.postMessage({ type: "ready" });

workerScope.addEventListener("message", async (e: MessageEvent) => {
  const { type, ...data } = e.data;

  if (type === "ping") {
    workerScope.postMessage({ type: "ready" });
    return;
  }

  if (type !== "process") return;

  try {
    const result = await processWatermark({
      rgbaPixels: new Uint8Array(data.rgbaPixels),
      width: data.width,
      height: data.height,
      jobId: data.jobId,
      mode: data.mode as WatermarkMode,
      protectionProfile: (data.protectionProfile as ProtectionProfile | undefined) ?? "hybrid",
      visibleWatermark: data.visibleWatermark as VisibleWatermarkOptions | undefined,
      uapData: data.uapData ? new Int8Array(data.uapData) : null,
      uapLayers: Array.isArray(data.uapLayers)
        ? data.uapLayers.map((layer: {
          data: ArrayBuffer;
          width: number;
          height: number;
          strength?: number;
          label?: string;
        }) => ({
          data: new Int8Array(layer.data),
          width: layer.width,
          height: layer.height,
          strength: layer.strength,
          label: layer.label,
        }))
        : null,
      uapWidth: data.uapWidth ?? 224,
      uapHeight: data.uapHeight ?? 224,
      onProgress(layer: string, percent: number) {
        workerScope.postMessage({ type: "progress", layer, percent });
      },
    });

    // Transfer the output buffer back to main thread (zero-copy)
    workerScope.postMessage(
      {
        type: "result",
        rgbaPixels: result.rgbaPixels.buffer,
        width: result.width,
        height: result.height,
        payload: result.payload,
        repeatFactor: result.repeatFactor,
        mode: result.mode,
        protectionProfile: result.protectionProfile,
        verification: result.verification,
        visibleWatermark: result.visibleWatermark,
        uapProfile: result.uapProfile,
      },
      [result.rgbaPixels.buffer] as Transferable[],
    );
  } catch (err) {
    workerScope.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});
