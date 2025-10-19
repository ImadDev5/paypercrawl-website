'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Zap } from 'lucide-react';

interface TestResult {
  success: boolean;
  blocked: boolean;
  detectionMethod?: string;
  confidence?: number;
  suspiciousScore?: number;
  warning?: string;
  firecrawlResponse?: any;
  detectionDetails?: {
    userAgent?: string;
    headers?: string[];
    ipType?: string;
    missingHeaders?: string[];
    analysisDetails?: string[];
  };
  error?: string;
}

export default function FirecrawlTestBench() {
  const [testUrl, setTestUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    if (!testUrl) return;

    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-firecrawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        blocked: false,
        error: 'Failed to run test: ' + (error as Error).message,
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (blocked: boolean) => {
    return blocked ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusIcon = (blocked: boolean) => {
    return blocked ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-orange-500" />
            Firecrawl Test Bench
          </h1>
          <p className="text-muted-foreground">
            Test your WordPress plugin's Firecrawl detection capabilities in real-time
          </p>
        </div>

        {/* Test Input */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Enter a WordPress site URL with CrawlGuard plugin installed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://your-wordpress-site.com"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runTest()}
              />
              <Button onClick={runTest} disabled={testing || !testUrl}>
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run Test'
                )}
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will use your Firecrawl API key to attempt scraping the target URL.
                The plugin should detect and block the request.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Quick Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
            <CardDescription>Test against common sites</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestUrl('https://white-zebra-414272.hostingersite.com')}
            >
              Test Site (Hostinger)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestUrl('https://lightslategray-bison-497689.hostingersite.com')}
            >
              PayPerCrawl Demo
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className={result.blocked ? 'border-green-500' : 'border-red-500'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(result.blocked)}
                Test Results
                <Badge className={getStatusColor(result.blocked)}>
                  {result.blocked ? 'BLOCKED ✓' : 'NOT BLOCKED ✗'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {result.blocked
                  ? 'Plugin successfully detected and blocked Firecrawl'
                  : 'Firecrawl was able to scrape the site'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}

              {result.warning && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> {result.warning}
                  </AlertDescription>
                </Alert>
              )}

              {result.detectionMethod && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Detection Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <p className="font-mono">{result.detectionMethod}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <p className="font-mono">{result.confidence}%</p>
                    </div>
                    {result.suspiciousScore !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Suspicious Score:</span>
                        <p className="font-mono">
                          {result.suspiciousScore} / 40 (threshold)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.detectionDetails && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Technical Analysis</h3>
                  <div className="bg-muted p-4 rounded-md space-y-2 text-sm font-mono">
                    {result.detectionDetails.userAgent && (
                      <div>
                        <span className="text-muted-foreground">User-Agent:</span>
                        <p className="text-xs break-all">{result.detectionDetails.userAgent}</p>
                      </div>
                    )}
                    {result.detectionDetails.ipType && (
                      <div>
                        <span className="text-muted-foreground">IP Type:</span>
                        <p>{result.detectionDetails.ipType}</p>
                      </div>
                    )}
                    {result.detectionDetails.headers && result.detectionDetails.headers.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Suspicious Headers:</span>
                        <ul className="list-disc list-inside">
                          {result.detectionDetails.headers.map((h, i) => (
                            <li key={i} className="text-orange-500">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.detectionDetails.missingHeaders && result.detectionDetails.missingHeaders.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Missing Headers:</span>
                        <ul className="list-disc list-inside">
                          {result.detectionDetails.missingHeaders.map((h, i) => (
                            <li key={i} className="text-yellow-500">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.detectionDetails.analysisDetails && result.detectionDetails.analysisDetails.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Score Breakdown:</span>
                        <ul className="list-disc list-inside">
                          {result.detectionDetails.analysisDetails.map((h, i) => (
                            <li key={i} className="text-blue-400">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.firecrawlResponse && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Firecrawl Response</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(result.firecrawlResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!result.blocked && result.firecrawlResponse && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Action Required:</strong> The plugin did not block Firecrawl.
                    Check that the plugin is installed, activated, and configured correctly
                    on the target WordPress site.
                  </AlertDescription>
                </Alert>
              )}

              {result.blocked && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <strong>Success!</strong> Your plugin successfully blocked Firecrawl.
                    This shows that your protection is working correctly.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>1. Firecrawl Attempt:</strong> We use your Firecrawl API key to attempt scraping the target URL.
            </p>
            <p>
              <strong>2. Plugin Detection:</strong> Your WordPress plugin checks for bot signatures, headers, and behavior patterns.
            </p>
            <p>
              <strong>3. Response Analysis:</strong> We analyze whether Firecrawl received content or was blocked.
            </p>
            <p className="pt-2 border-t">
              <strong>Expected Results:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Blocked = Plugin working correctly (HTTP 402, 429, or no content)</li>
              <li>❌ Not Blocked = Plugin needs configuration or update</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
