import { Suspense } from "react";
import BotAnalyzerClient from "./BotAnalyzerClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Bot Traffic Analyzer | PayPerCrawl",
  description: "Analyze any website for AI bot exposure and crawling activity",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function BotAnalyzerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-background">
        <BotAnalyzerClient />
      </div>
    </Suspense>
  );
}
