"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  ImageUp,
  Loader2,
  Shield,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Upload,
  Zap,
} from "lucide-react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type {
  ProtectionProfile,
  UapLayerInput,
  WatermarkMode as ClientWatermarkMode,
} from "@/lib/watermarkity/client-engine";

type StageKey = "prepare" | "uap" | "patch" | "dct" | "chroma" | "visible" | "qim" | "verify";

type ResultState = {
  previewUrl: string;
  payload: string;
  mode: string;
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
};

type UapBlendEntry = {
  id: string;
  weight: number;
};

type UapManifestCategory = {
  id: string;
  file: string;
  label: string;
};

type UapManifest = {
  version: number;
  patchSize: number;
  channels: number;
  bytesPerUAP: number;
  categories: UapManifestCategory[];
  blendProfiles?: Partial<Record<string, UapBlendEntry[]>>;
};

type ImageStats = {
  avgLuma: number;
  avgSaturation: number;
  edgeDensity: number;
};

type UapSelectionPlan = {
  profileId: string;
  reason: string;
  layers: UapBlendEntry[];
};

const DEFAULT_UAP_MANIFEST: UapManifest = {
  version: 1,
  patchSize: 224,
  channels: 3,
  bytesPerUAP: 150528,
  categories: [
    { id: "general", file: "general.bin", label: "General purpose" },
    { id: "landscape", file: "landscape.bin", label: "Landscapes & nature" },
    { id: "face", file: "face.bin", label: "Portraits & faces" },
    { id: "text", file: "text.bin", label: "Documents & text" },
    { id: "product", file: "product.bin", label: "Products & objects" },
    { id: "art", file: "art.bin", label: "Art & illustrations" },
    { id: "urban", file: "urban.bin", label: "Urban & architecture" },
    { id: "abstract", file: "abstract.bin", label: "Abstract & patterns" },
  ],
  blendProfiles: {
    robust: [{ id: "general", weight: 1 }],
    balanced: [
      { id: "general", weight: 0.7 },
      { id: "urban", weight: 0.18 },
      { id: "product", weight: 0.12 },
    ],
    forensic: [
      { id: "general", weight: 0.45 },
      { id: "text", weight: 0.25 },
      { id: "abstract", weight: 0.3 },
    ],
    textHeavy: [
      { id: "general", weight: 0.45 },
      { id: "text", weight: 0.4 },
      { id: "product", weight: 0.15 },
    ],
    vivid: [
      { id: "general", weight: 0.4 },
      { id: "art", weight: 0.35 },
      { id: "abstract", weight: 0.25 },
    ],
    structured: [
      { id: "general", weight: 0.5 },
      { id: "urban", weight: 0.3 },
      { id: "product", weight: 0.2 },
    ],
    soft: [
      { id: "general", weight: 0.55 },
      { id: "landscape", weight: 0.3 },
      { id: "face", weight: 0.15 },
    ],
  },
};

const STAGE_ORDER: StageKey[] = ["prepare", "uap", "patch", "dct", "chroma", "visible", "qim", "verify"];

const STAGE_META: Record<StageKey, { label: string; detail: string }> = {
  prepare: {
    label: "Prepare",
    detail: "Decode the image, scale it for browser-safe processing, and move the pixels into the worker.",
  },
  uap: {
    label: "Adversarial Pattern",
    detail: "Apply the precomputed anti-AI perturbation map used to disrupt downstream vision models.",
  },
  patch: {
    label: "Patch Perturbation",
    detail: "Correlate perturbations with ViT patch structure so the signal survives model patch embedding.",
  },
  dct: {
    label: "Frequency Layer",
    detail: "Inject mid-frequency changes that stay resilient while remaining lighter on visible quality.",
  },
  chroma: {
    label: "Chromatic Shift",
    detail: "Introduce cross-channel offsets that are cheap for the browser and hostile to AI feature extraction.",
  },
  visible: {
    label: "Visible Attribution",
    detail: "Render the visible branded mark if the current protection profile includes it.",
  },
  qim: {
    label: "Invisible Watermark",
    detail: "Embed the durable verification payload after the visible layer so the identifier remains intact.",
  },
  verify: {
    label: "Integrity Check",
    detail: "Decode the embedded payload immediately and score the resulting watermark confidence.",
  },
};

function computeImageStats(pixels: Uint8ClampedArray, width: number, height: number): ImageStats {
  const sampleTarget = 4096;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / sampleTarget)));
  let lumaTotal = 0;
  let saturationTotal = 0;
  let edgeTotal = 0;
  let count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx] / 255;
      const g = pixels[idx + 1] / 255;
      const b = pixels[idx + 2] / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) * 255;

      lumaTotal += luma;
      saturationTotal += max === 0 ? 0 : (max - min) / max;

      if (x + step < width && y + step < height) {
        const right = (y * width + (x + step)) * 4;
        const down = ((y + step) * width + x) * 4;
        const rightLuma = 0.299 * pixels[right] + 0.587 * pixels[right + 1] + 0.114 * pixels[right + 2];
        const downLuma = 0.299 * pixels[down] + 0.587 * pixels[down + 1] + 0.114 * pixels[down + 2];
        edgeTotal += Math.abs(luma - rightLuma) + Math.abs(luma - downLuma);
      }

      count++;
    }
  }

  return {
    avgLuma: count ? lumaTotal / count : 0,
    avgSaturation: count ? saturationTotal / count : 0,
    edgeDensity: count ? edgeTotal / count : 0,
  };
}

function chooseUapPlan(
  mode: ClientWatermarkMode,
  protectionProfile: ProtectionProfile,
  stats: ImageStats,
  manifest: UapManifest,
): UapSelectionPlan {
  if (protectionProfile === "visible") {
    return {
      profileId: "none",
      reason: "Visible-only mode skips the adversarial asset stack.",
      layers: [],
    };
  }

  const blendProfiles = manifest.blendProfiles ?? DEFAULT_UAP_MANIFEST.blendProfiles ?? {};
  let profileId = mode;
  let reason = "Using the mode default blend.";

  if (stats.avgSaturation < 0.14 && stats.edgeDensity > 46) {
    profileId = "textHeavy";
    reason = "Detected low-saturation high-edge content; biasing toward document-safe disruption.";
  } else if (stats.avgSaturation > 0.34 && stats.edgeDensity > 24) {
    profileId = "vivid";
    reason = "Detected vivid structured content; biasing toward art and abstract assets.";
  } else if (stats.edgeDensity > 34) {
    profileId = "structured";
    reason = "Detected dense structure; biasing toward urban and product assets.";
  } else if (stats.avgLuma > 150 && stats.edgeDensity < 20) {
    profileId = "soft";
    reason = "Detected lighter low-edge content; biasing toward soft natural imagery assets.";
  }

  const layers = blendProfiles[profileId] ?? blendProfiles[mode] ?? DEFAULT_UAP_MANIFEST.blendProfiles?.[mode] ?? [{ id: "general", weight: 1 }];
  return { profileId, reason, layers };
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatPixels(width: number, height: number) {
  return `${width.toLocaleString()} × ${height.toLocaleString()}`;
}

export default function BrowserWatermarkityClient() {
  const { toast } = useToast();

  const [watermarkMode, setWatermarkMode] = useState<ClientWatermarkMode>("balanced");
  const [protectionProfile, setProtectionProfile] = useState<ProtectionProfile>("hybrid");
  const [visibleWatermarkText, setVisibleWatermarkText] = useState("Watermarkity");
  const [file, setFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientProgress, setClientProgress] = useState<{ layer: StageKey; percent: number } | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [inputDimensions, setInputDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef(false);
  const uapManifestRef = useRef<UapManifest | null>(null);
  const uapCacheRef = useRef<Map<string, ArrayBuffer>>(new Map());

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      workerReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!sourcePreviewUrl) return;
    return () => URL.revokeObjectURL(sourcePreviewUrl);
  }, [sourcePreviewUrl]);

  useEffect(() => {
    if (!result?.previewUrl) return;
    return () => URL.revokeObjectURL(result.previewUrl);
  }, [result]);

  useEffect(() => {
    if (!isProcessing || startedAt === null) {
      setElapsedMs(0);
      return;
    }

    const tick = () => setElapsedMs(Date.now() - startedAt);
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [isProcessing, startedAt]);

  const maxPixelsForMode = (mode: ClientWatermarkMode, profile: ProtectionProfile) => {
    if (profile === "visible") return 2_200_000;
    if (mode === "forensic") return 650_000;
    if (mode === "balanced") return 900_000;
    return 1_200_000;
  };

  const disposeWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    workerReadyRef.current = false;
  };

  const createWorker = () => {
    disposeWorker();
    const worker = new Worker(
      new URL("../../../lib/watermarkity/watermark.worker.ts", import.meta.url),
    );
    workerRef.current = worker;
    workerReadyRef.current = false;
    return worker;
  };

  const ensureWorkerReady = async () => {
    const worker = workerRef.current ?? createWorker();

    if (workerReadyRef.current) {
      return worker;
    }

    await new Promise<void>((resolve, reject) => {
      const startupTimeout = window.setTimeout(() => {
        cleanup();
        disposeWorker();
        reject(new Error("The processing worker did not initialize in time."));
      }, 8000);

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type !== "ready") return;
        cleanup();
        workerReadyRef.current = true;
        resolve();
      };

      const handleError = () => {
        cleanup();
        disposeWorker();
        reject(new Error("The processing worker failed to initialize."));
      };

      const cleanup = () => {
        window.clearTimeout(startupTimeout);
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.postMessage({ type: "ping" });
    });

    return worker;
  };

  const computeTimeoutMs = (pixelCount: number, mode: ClientWatermarkMode, profile: ProtectionProfile) => {
    const megaPixels = pixelCount / 1_000_000;
    if (profile === "visible") {
      const timeout = 120_000 + megaPixels * 45_000;
      return Math.max(120_000, Math.min(900_000, Math.round(timeout)));
    }

    const perMp = mode === "forensic" ? 180_000 : mode === "balanced" ? 120_000 : 90_000;
    const base = mode === "forensic" ? 480_000 : mode === "balanced" ? 300_000 : 240_000;
    const timeout = base + megaPixels * perMp;
    return Math.max(300_000, Math.min(1_800_000, Math.round(timeout)));
  };

  const loadUapManifest = async () => {
    if (uapManifestRef.current) {
      return uapManifestRef.current;
    }

    try {
      const res = await fetch("/uaps/manifest.json", { cache: "force-cache" });
      if (!res.ok) throw new Error("manifest unavailable");
      const manifest = (await res.json()) as UapManifest;
      uapManifestRef.current = {
        ...DEFAULT_UAP_MANIFEST,
        ...manifest,
        categories: manifest.categories?.length ? manifest.categories : DEFAULT_UAP_MANIFEST.categories,
        blendProfiles: {
          ...DEFAULT_UAP_MANIFEST.blendProfiles,
          ...(manifest.blendProfiles ?? {}),
        },
      };
    } catch {
      uapManifestRef.current = DEFAULT_UAP_MANIFEST;
    }

    return uapManifestRef.current;
  };

  const loadUapLayers = async (manifest: UapManifest, plan: UapSelectionPlan): Promise<UapLayerInput[]> => {
    const layers: UapLayerInput[] = [];

    for (const entry of plan.layers) {
      const category = manifest.categories.find((item) => item.id === entry.id);
      if (!category) continue;

      let buffer = uapCacheRef.current.get(category.file) ?? null;
      if (!buffer) {
        try {
          const res = await fetch(`/uaps/${category.file}`, { cache: "force-cache" });
          if (!res.ok) continue;
          buffer = await res.arrayBuffer();
          uapCacheRef.current.set(category.file, buffer);
        } catch {
          continue;
        }
      }

      layers.push({
        data: new Int8Array(buffer.slice(0)),
        width: manifest.patchSize || 224,
        height: manifest.patchSize || 224,
        strength: entry.weight,
        label: category.id,
      });
    }

    return layers;
  };

  const currentStageIndex = clientProgress ? STAGE_ORDER.indexOf(clientProgress.layer) : -1;
  const overallProgress = clientProgress
    ? Math.min(
        100,
        Math.round((currentStageIndex / STAGE_ORDER.length) * 100 + (clientProgress.percent / 100) * (100 / STAGE_ORDER.length)),
      )
    : 0;

  const onFileSelected = (nextFile: File | null) => {
    setFile(nextFile);
    setError("");
    setResult(null);
    setProcessedDimensions(null);
    setInputDimensions(null);

    if (sourcePreviewUrl) {
      URL.revokeObjectURL(sourcePreviewUrl);
      setSourcePreviewUrl(null);
    }

    if (!nextFile) return;
    setSourcePreviewUrl(URL.createObjectURL(nextFile));
  };

  const resetAll = () => {
    setError("");
    setFile(null);
    setResult(null);
    setClientProgress(null);
    setStartedAt(null);
    setElapsedMs(0);
    setInputDimensions(null);
    setProcessedDimensions(null);
    if (sourcePreviewUrl) {
      URL.revokeObjectURL(sourcePreviewUrl);
      setSourcePreviewUrl(null);
    }
  };

  const processClientSide = async () => {
    if (!file) {
      setError("Select an image file to protect.");
      return;
    }

    setError("");
    setResult(null);
    setIsProcessing(true);
    setClientProgress({ layer: "prepare", percent: 0 });
    setStartedAt(Date.now());

    try {
      const img = new Image();
      const fileUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to decode the selected image."));
        img.src = fileUrl;
      });

      setInputDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const canvas = document.createElement("canvas");
      let processWidth = img.naturalWidth;
      let processHeight = img.naturalHeight;
      const sourcePixels = processWidth * processHeight;
      const maxProcessPixels = maxPixelsForMode(watermarkMode, protectionProfile);

      if (sourcePixels > maxProcessPixels) {
        const scale = Math.sqrt(maxProcessPixels / sourcePixels);
        processWidth = Math.max(1, Math.round(processWidth * scale));
        processHeight = Math.max(1, Math.round(processHeight * scale));
        toast({
          title: "Large image optimized",
          description: `Processing resized to ${formatPixels(processWidth, processHeight)} for stable browser execution.`,
        });
      }

      setProcessedDimensions({ width: processWidth, height: processHeight });

      canvas.width = processWidth;
      canvas.height = processHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable in this browser.");
      ctx.drawImage(img, 0, 0, processWidth, processHeight);

      const imageData = ctx.getImageData(0, 0, processWidth, processHeight);
      URL.revokeObjectURL(fileUrl);

      const imageStats = computeImageStats(imageData.data, processWidth, processHeight);
      const uapManifest = await loadUapManifest();
      const uapPlan = chooseUapPlan(watermarkMode, protectionProfile, imageStats, uapManifest);
      const uapLayers = await loadUapLayers(uapManifest, uapPlan);

      let worker: Worker;
      try {
        worker = await ensureWorkerReady();
      } catch {
        const { processWatermark } = await import("@/lib/watermarkity/client-engine");
        setClientProgress({ layer: "prepare", percent: 20 });
        const mainThreadResult = await processWatermark({
          rgbaPixels: imageData.data,
          width: processWidth,
          height: processHeight,
          jobId: crypto.randomUUID(),
          mode: watermarkMode,
          protectionProfile,
          visibleWatermark: {
            enabled: protectionProfile !== "invisible",
            text: visibleWatermarkText.trim() || "Watermarkity",
          },
          uapLayers,
          uapWidth: uapManifest.patchSize || 224,
          uapHeight: uapManifest.patchSize || 224,
          onProgress(layer, percent) {
            setClientProgress({ layer: layer as StageKey, percent });
          },
        });

        const resultPixels = new Uint8ClampedArray(mainThreadResult.rgbaPixels.buffer.slice(0));
        const resultImage = new ImageData(resultPixels, mainThreadResult.width, mainThreadResult.height);
        canvas.width = mainThreadResult.width;
        canvas.height = mainThreadResult.height;
        ctx.putImageData(resultImage, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((nextBlob) => {
            if (!nextBlob) {
              reject(new Error("Failed to encode the protected image."));
              return;
            }
            resolve(nextBlob);
          }, "image/jpeg", 0.94);
        });

        setResult({
          previewUrl: URL.createObjectURL(blob),
          payload: mainThreadResult.payload,
          mode: mainThreadResult.mode,
          protectionProfile: mainThreadResult.protectionProfile,
          verification: mainThreadResult.verification,
          visibleWatermark: mainThreadResult.visibleWatermark,
          uapProfile: mainThreadResult.uapProfile,
        });
        setClientProgress({ layer: "verify", percent: 100 });
        toast({
          title: "Protection complete",
          description: `${uapPlan.reason} Confidence ${(mainThreadResult.verification.confidence * 100).toFixed(1)}%.`,
        });
        return;
      }

      const jobId = crypto.randomUUID();

      await new Promise<void>((resolve, reject) => {
        const timeoutMs = computeTimeoutMs(processWidth * processHeight, watermarkMode, protectionProfile);
        const workerStallMs = 20_000;
        let settled = false;
        let lastWorkerActivityAt = Date.now();

        const timeout = window.setTimeout(() => {
          if (settled) return;
          settled = true;
          disposeWorker();
          reject(new Error(`Processing timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
        }, timeoutMs);

        const stallInterval = window.setInterval(() => {
          if (settled) return;
          if (Date.now() - lastWorkerActivityAt < workerStallMs) return;
          settled = true;
          cleanup();
          disposeWorker();
          reject(new Error("Processing stalled in the browser worker. Please retry with the optimized browser path."));
        }, 2000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.clearInterval(stallInterval);
        };

        worker.onmessage = (event: MessageEvent) => {
          const { type, ...data } = event.data;
          lastWorkerActivityAt = Date.now();
          if (type === "progress") {
            setClientProgress({ layer: data.layer as StageKey, percent: data.percent });
            return;
          }

          if (type === "error") {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error(String(data.message || "Watermark processing failed.")));
            return;
          }

          if (type !== "result" || settled) return;

          settled = true;
          cleanup();

          const resultPixels = new Uint8ClampedArray(data.rgbaPixels as ArrayBuffer);
          const resultImage = new ImageData(resultPixels, data.width, data.height);
          canvas.width = data.width;
          canvas.height = data.height;
          ctx.putImageData(resultImage, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to encode the protected image."));
                return;
              }

              setResult({
                previewUrl: URL.createObjectURL(blob),
                payload: data.payload,
                mode: data.mode,
                protectionProfile: data.protectionProfile,
                verification: data.verification,
                visibleWatermark: data.visibleWatermark,
                uapProfile: data.uapProfile,
              });

              setClientProgress({ layer: "verify", percent: 100 });
              toast({
                title: "Protection complete",
                description: `${uapPlan.reason} Confidence ${(data.verification.confidence * 100).toFixed(1)}%.`,
              });
              resolve();
            },
            "image/jpeg",
            0.94,
          );
        };

        worker.onerror = (event: ErrorEvent) => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error(event.message || "Worker execution failed."));
        };

        const transferList: Transferable[] = [imageData.data.buffer];
        const message: Record<string, unknown> = {
          type: "process",
          rgbaPixels: imageData.data.buffer,
          width: processWidth,
          height: processHeight,
          jobId,
          mode: watermarkMode,
          protectionProfile,
          visibleWatermark: {
            enabled: protectionProfile !== "invisible",
            text: visibleWatermarkText.trim() || "Watermarkity",
          },
          uapWidth: uapManifest.patchSize || 224,
          uapHeight: uapManifest.patchSize || 224,
        };

        if (uapLayers.length > 0) {
          const transferableLayers = uapLayers.map((layer) => {
            const dataClone = layer.data.buffer.slice(0);
            transferList.push(dataClone);
            return {
              data: dataClone,
              width: layer.width,
              height: layer.height,
              strength: layer.strength,
              label: layer.label,
            };
          });
          message.uapLayers = transferableLayers;
        }

        worker.postMessage(message, transferList);
      });
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Browser-side processing failed.");
    } finally {
      setIsProcessing(false);
      setStartedAt(null);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const anchor = document.createElement("a");
    anchor.href = result.previewUrl;
    const baseName = file?.name?.replace(/\.[^.]+$/, "") || "image";
    anchor.download = `${baseName}-watermarkity.jpg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold">Watermarkity Browser Studio</h1>
                <Badge variant="outline">Browser Only</Badge>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                Protect images locally in your browser with anti-AI perturbations, visible attribution,
                and an embedded verification watermark. Nothing is uploaded and no server-side queue runs anymore.
              </p>
            </div>

            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {error && (
            <Alert className="border-red-300/50 bg-red-50/70 text-red-900 dark:bg-red-950/30 dark:text-red-100">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
            <Card className="overflow-hidden border-border/70 bg-background/80 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Protection Controls</CardTitle>
                </div>
                <CardDescription>
                  Choose the protection profile, load a file, and run the worker directly in the browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="wm-mode">Protection Mode</Label>
                    <select
                      id="wm-mode"
                      value={watermarkMode}
                      onChange={(event) => setWatermarkMode(event.target.value as ClientWatermarkMode)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="robust">Robust — subtle anti-AI protection</option>
                      <option value="balanced">Balanced — recommended production default</option>
                      <option value="forensic">Forensic — strongest disruption</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wm-profile">Protection Profile</Label>
                    <select
                      id="wm-profile"
                      value={protectionProfile}
                      onChange={(event) => setProtectionProfile(event.target.value as ProtectionProfile)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="hybrid">Hybrid — visible plus invisible protection</option>
                      <option value="visible">Visible only — fast branded deterrence</option>
                      <option value="invisible">Invisible only — clean output with verification</option>
                    </select>
                  </div>
                </div>

                {protectionProfile !== "invisible" && (
                  <div className="space-y-2">
                    <Label htmlFor="wm-visible-text">Visible Watermark Text</Label>
                    <Input
                      id="wm-visible-text"
                      value={visibleWatermarkText}
                      onChange={(event) => setVisibleWatermarkText(event.target.value)}
                      placeholder="Watermarkity"
                      maxLength={48}
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Select an image</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Large files are automatically resized for stable local execution.</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => onFileSelected(event.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button onClick={processClientSide} disabled={!file || isProcessing} size="lg">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Protecting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Protect Image
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetAll}>
                    <TimerReset className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>

                <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Input</p>
                    <p className="mt-1 text-sm font-medium">{file?.name || "No image selected"}</p>
                    <p className="text-xs text-muted-foreground">
                      {inputDimensions ? formatPixels(inputDimensions.width, inputDimensions.height) : "Waiting for a file"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Worker Output</p>
                    <p className="mt-1 text-sm font-medium">
                      {processedDimensions ? formatPixels(processedDimensions.width, processedDimensions.height) : "Not processed yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {protectionProfile === "visible"
                        ? "Visible-only path uses the fastest browser profile."
                        : "Anti-AI layers run entirely in the browser worker."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="overflow-hidden border-border/70 shadow-sm">
                <CardHeader className="border-b border-border/60 bg-gradient-to-br from-background via-background to-primary/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>Real-Time Processing</CardTitle>
                      <CardDescription>
                        Watch the worker move through each stage in real time. The browser-only flow is now the only active path.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {isProcessing ? formatDuration(elapsedMs) : "idle"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-background to-background p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overall Progress</p>
                        <p className="mt-1 text-2xl font-semibold">{overallProgress}%</p>
                      </div>
                      <Badge variant={isProcessing ? "default" : result ? "outline" : "secondary"}>
                        {isProcessing ? "worker active" : result ? "complete" : "ready"}
                      </Badge>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {clientProgress
                        ? STAGE_META[clientProgress.layer].detail
                        : "Choose an image and start the browser worker to see the live stage tracker."}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {STAGE_ORDER.map((stage, index) => {
                      const isCurrent = clientProgress?.layer === stage;
                      const isComplete = currentStageIndex > index || (!isProcessing && result !== null);
                      const stagePercent = isCurrent ? clientProgress?.percent ?? 0 : isComplete ? 100 : 0;

                      return (
                        <div key={stage} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${isComplete ? "bg-green-500/15 text-green-600" : isCurrent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : isCurrent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{STAGE_META[stage].label}</p>
                                <p className="text-sm text-muted-foreground">{STAGE_META[stage].detail}</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{stagePercent}%</span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isComplete ? "bg-green-500" : isCurrent ? "bg-primary" : "bg-muted"}`}
                              style={{ width: `${stagePercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/70 shadow-sm">
                <CardHeader className="border-b border-border/60">
                  <CardTitle>Preview and Export</CardTitle>
                  <CardDescription>
                    Compare the selected image with the protected result and download the final output directly from the browser.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Original</p>
                        {inputDimensions && <Badge variant="outline">{formatPixels(inputDimensions.width, inputDimensions.height)}</Badge>}
                      </div>
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                        {sourcePreviewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sourcePreviewUrl} alt="Selected source" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            <ImageUp className="mr-2 h-4 w-4" />
                            Select an image to preview it here.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Protected Result</p>
                        {result && <Badge className="bg-green-600 text-white">ready</Badge>}
                      </div>
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                        {result ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={result.previewUrl} alt="Protected result" className="h-full w-full object-contain" />
                        ) : isProcessing ? (
                          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <div>
                              <p className="font-medium text-foreground">Worker is rendering the protected output</p>
                              <p>{clientProgress ? STAGE_META[clientProgress.layer].label : "Waiting for worker progress"}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            The protected image will appear here after the worker finishes.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {result && (
                    <>
                      <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Confidence</p>
                          <p className="mt-1 text-xl font-semibold">{(result.verification.confidence * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Bit Accuracy</p>
                          <p className="mt-1 text-xl font-semibold">{(result.verification.directAccuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mode</p>
                          <p className="mt-1 text-sm font-medium capitalize">{result.mode}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
                          <p className="mt-1 text-sm font-medium capitalize">{result.protectionProfile}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Watermark ID</p>
                        <p className="mt-2 break-all font-mono text-sm">{result.verification.watermarkId}</p>
                        {result.uapProfile.strategy !== "none" && result.uapProfile.layers.length > 0 && (
                          <p className="mt-3 text-sm text-muted-foreground">
                            UAP blend: <span className="font-medium text-foreground">{result.uapProfile.layers.join(", ")}</span>
                          </p>
                        )}
                        {result.visibleWatermark.enabled && result.visibleWatermark.text && (
                          <p className="mt-3 text-sm text-muted-foreground">
                            Visible watermark text: <span className="font-medium text-foreground">{result.visibleWatermark.text}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button size="lg" onClick={downloadResult}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Protected Image
                        </Button>
                        <Badge variant="outline" className="px-3 py-2 text-sm">
                          <Shield className="mr-2 h-4 w-4" />
                          Local output only
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}