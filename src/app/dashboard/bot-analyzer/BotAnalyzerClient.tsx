"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Search,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Globe,
  FileText,
  Bot,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface AnalysisResult {
  domain: string;
  riskScore: "low" | "medium" | "high" | "critical";
  robotsTxt: {
    exists: boolean;
    allowsAIBots: boolean;
    blockedBots: string[];
    allowedBots: string[];
    sitemaps?: string[];
  };
  sitemap: {
    exists: boolean;
    pageCount: number;
    urls: string[];
    estimated?: boolean;
  };
  techStack: {
    platform: string;
    hasProtection: boolean;
    indicators?: string[];
  };
  estimates: {
    monthlyBotRequests: number;
    botTrafficPercentage: number;
    estimatedMonthlyCost: number;
  };
  aiCrawlers: {
    name: string;
    allowed: boolean;
    company: string;
  }[];
  firecrawl?: {
    success: boolean;
    discoveredCount: number;
    topics?: string[];
  };
}

export default function BotAnalyzerClient() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const analyzeWebsite = async () => {
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/bot-analyzer/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.result);
      } else {
        setError(data.error || "Failed to analyze website");
      }
    } catch (err) {
      setError("An error occurred while analyzing the website");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200";
      case "high":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200";
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200";
      case "low":
        return "text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950/30 border-gray-200";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "critical":
        return "CRITICAL EXPOSURE";
      case "high":
        return "HIGH RISK";
      case "medium":
        return "MEDIUM RISK";
      case "low":
        return "LOW RISK";
      default:
        return "UNKNOWN";
    }
  };

  const getFirecrawlConfidence = (fc?: AnalysisResult["firecrawl"]) => {
    if (!fc || !fc.success || !fc.discoveredCount) return { label: "", cls: "" };
    if (fc.discoveredCount >= 20) return { label: "High", cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30" };
    if (fc.discoveredCount >= 5) return { label: "Medium", cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30" };
    return { label: "Low", cls: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/30" };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b nav-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold text-foreground">
                PayPerCrawl
              </span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Search className="h-8 w-8 text-primary pulse-glow" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Bot Traffic Analyzer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Enter any website URL to analyze its exposure to AI bots and crawlers.
            Get instant insights on bot traffic, risk levels, and estimated costs.
          </p>
        </div>

        {/* Analyzer Form */}
        <Card className="max-w-4xl mx-auto mb-8 glass-card hover-glow">
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>
              Enter a domain (e.g., example.com or https://example.com)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="url" className="sr-only">
                  Website URL
                </Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && analyzeWebsite()}
                  className="text-lg"
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                onClick={analyzeWebsite}
                disabled={isAnalyzing || !url}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Risk Score Card */}
              <Card className={`glass-card hover-glow ${getRiskColor(analysisResult.riskScore)}`}>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Badge
                    variant="outline"
                    className={`text-lg px-6 py-2 ${getRiskColor(analysisResult.riskScore)}`}
                  >
                    {getRiskLabel(analysisResult.riskScore)}
                  </Badge>
                  <h2 className="text-3xl font-bold">{analysisResult.domain}</h2>
                    <p className="text-muted-foreground">Analysis completed successfully</p>
                  {analysisResult.firecrawl && analysisResult.firecrawl.success && analysisResult.firecrawl.discoveredCount > 0 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30">
                        Powered by Firecrawl
                      </Badge>
                      {(() => {
                        const { label, cls } = getFirecrawlConfidence(analysisResult.firecrawl);
                        return (
                          <Badge variant="outline" className={cls}>
                            Confidence: {label}
                          </Badge>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detection Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Robots.txt Status */}
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">robots.txt Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">File Exists</span>
                    {analysisResult.robotsTxt.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Allows AI Bots</span>
                    {analysisResult.robotsTxt.allowsAIBots ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Blocked Bots: {analysisResult.robotsTxt.blockedBots.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Allowed Bots: {analysisResult.robotsTxt.allowedBots.length}
                    </p>
                    {analysisResult.robotsTxt.sitemaps && analysisResult.robotsTxt.sitemaps.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Sitemaps Discovered: {analysisResult.robotsTxt.sitemaps.length}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.robotsTxt.sitemaps.slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {s.length > 36 ? s.slice(0, 33) + "..." : s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sitemap Info */}
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Sitemap Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sitemap Found</span>
                    {analysisResult.sitemap.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="text-center pt-2 border-t">
                    <p className="text-3xl font-bold text-primary">
                      {analysisResult.sitemap.estimated ? "~" : ""}
                      {analysisResult.sitemap.pageCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pages Exposed{analysisResult.sitemap.estimated ? " (estimated)" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack */}
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Tech Stack</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <Badge variant="outline">{analysisResult.techStack.platform}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bot Protection</span>
                    {analysisResult.techStack.hasProtection ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {analysisResult.techStack.indicators && analysisResult.techStack.indicators.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Indicators</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.techStack.indicators.slice(0, 4).map((ind, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Estimated Impact */}
            <Card className="glass-card hover-glow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">Estimated Impact</CardTitle>
                </div>
                <CardDescription>
                  Based on industry benchmarks for sites with similar characteristics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Monthly Bot Requests */}
                  <div className="text-center p-6 bg-accent/20 rounded-lg">
                    <Bot className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-3xl font-bold text-foreground">
                      {analysisResult.estimates.monthlyBotRequests.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bot Requests/Month
                    </p>
                  </div>

                  {/* Bot Traffic Percentage */}
                  <div className="text-center p-6 bg-accent/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-3xl font-bold text-foreground">
                      {analysisResult.estimates.botTrafficPercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bot Traffic
                    </p>
                    <Progress 
                      value={analysisResult.estimates.botTrafficPercentage} 
                      className="mt-2"
                    />
                  </div>

                  {/* Estimated Cost */}
                  <div className="text-center p-6 bg-accent/20 rounded-lg">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-3xl font-bold text-foreground">
                      ${analysisResult.estimates.estimatedMonthlyCost}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimated Monthly Cost
                    </p>
                  </div>
                </div>

                <Alert className="mt-6 bg-blue-50/80 dark:bg-blue-950/30 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    *These are estimates based on industry benchmarks for similar sites.
                    Install our tracking to get accurate real-time data.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* AI Crawlers List */}
            <Card className="glass-card hover-glow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">AI Crawlers Analysis</CardTitle>
                </div>
                <CardDescription>
                  Which AI bots can access your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisResult.aiCrawlers.map((crawler, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-accent/20 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Bot className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{crawler.name}</p>
                          <p className="text-xs text-muted-foreground">{crawler.company}</p>
                        </div>
                      </div>
                      {crawler.allowed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 glass-card hover-glow">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold">Want Accurate Real-Time Data?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  These estimates give you an idea of your exposure. Install PayPerCrawl 
                  to get precise bot detection, real traffic numbers, and start monetizing 
                  AI bot visits today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      <Shield className="mr-2 h-5 w-5" />
                      Get Started Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline">
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
