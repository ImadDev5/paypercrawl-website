import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BrowserWatermarkityClient from "./BrowserWatermarkityClient";

export const metadata = {
  title: "Watermarkity Browser Studio | PayPerCrawl",
  description: "Protect images locally in your browser with real-time progress and anti-AI watermarking.",
};

export const dynamic = "force-dynamic";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function WatermarkityPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-background">
        <BrowserWatermarkityClient />
      </div>
    </Suspense>
  );
}
