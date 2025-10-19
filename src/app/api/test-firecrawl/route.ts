import { NextRequest, NextResponse } from 'next/server';
import Firecrawl from '@mendable/firecrawl-js';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Initialize Firecrawl with API key
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Firecrawl API key not configured' },
        { status: 500 }
      );
    }

    const firecrawl = new Firecrawl({ apiKey });

    let result: any = {
      success: false,
      blocked: false,
    };

    try {
      // Attempt to scrape the URL with Firecrawl
      const scrapeResponse = await firecrawl.scrape(url, {
        formats: ['markdown', 'html'],
      });

      // If we got here with content, it means we weren't blocked
      const gotContent = scrapeResponse?.markdown && scrapeResponse.markdown.length > 100;
      
      result = {
        success: true,
        blocked: !gotContent,
        firecrawlResponse: {
          statusCode: scrapeResponse?.metadata?.statusCode,
          contentLength: scrapeResponse?.markdown?.length || 0,
          title: scrapeResponse?.metadata?.title,
          metadata: scrapeResponse?.metadata,
          // Don't send full content to avoid bloat
          markdownPreview: scrapeResponse?.markdown?.substring(0, 500),
        },
      };

      // Analyze the response to determine if it was blocked
      if (scrapeResponse?.metadata?.statusCode === 402) {
        result.blocked = true;
        result.detectionMethod = 'HTTP 402 Payment Required';
        result.confidence = 100;
      } else if (scrapeResponse?.metadata?.statusCode === 429) {
        result.blocked = true;
        result.detectionMethod = 'HTTP 429 Rate Limit Exceeded';
        result.confidence = 100;
      } else if (scrapeResponse?.metadata?.statusCode === 403) {
        result.blocked = true;
        result.detectionMethod = 'HTTP 403 Forbidden';
        result.confidence = 95;
      } else if (!gotContent) {
        result.blocked = true;
        result.detectionMethod = 'No content received';
        result.confidence = 80;
      } else {
        // Got content successfully - not blocked
        result.blocked = false;
        result.detectionDetails = {
          userAgent: 'Firecrawl (via API)',
          ipType: 'Firecrawl Service',
        };
      }

    } catch (error: any) {
      // Check if the error is due to blocking
      const errorMessage = error?.message || error?.toString() || '';
      const errorStatus = error?.response?.status || error?.statusCode || 0;

      if (errorStatus === 402 || errorMessage.includes('402')) {
        result = {
          success: true,
          blocked: true,
          detectionMethod: 'HTTP 402 Payment Required (via exception)',
          confidence: 100,
          error: errorMessage,
        };
      } else if (errorStatus === 429 || errorMessage.includes('429')) {
        result = {
          success: true,
          blocked: true,
          detectionMethod: 'HTTP 429 Rate Limited (via exception)',
          confidence: 100,
          error: errorMessage,
        };
      } else if (errorStatus === 403 || errorMessage.includes('403')) {
        result = {
          success: true,
          blocked: true,
          detectionMethod: 'HTTP 403 Forbidden (via exception)',
          confidence: 95,
          error: errorMessage,
        };
      } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        result = {
          success: true,
          blocked: true,
          detectionMethod: 'Request Timeout (possible blocking)',
          confidence: 70,
          error: errorMessage,
        };
      } else {
        // Genuine error, not blocking
        result = {
          success: false,
          blocked: false,
          error: 'Firecrawl error: ' + errorMessage,
        };
      }
    }

    // Add detection analysis - but don't override actual blocking status
    if (result.firecrawlResponse) {
      result.detectionDetails = {
        ...result.detectionDetails,
        missingHeaders: [],
      };

      // Simulate what the WordPress plugin SHOULD check
      const analysis = analyzeResponse(result.firecrawlResponse);
      result.suspiciousScore = analysis.score;
      result.detectionDetails.analysisDetails = analysis.details;
      
      // If we got content successfully, it means NOT blocked (regardless of score)
      if (result.firecrawlResponse.statusCode === 200 && result.firecrawlResponse.contentLength > 100) {
        result.blocked = false;
        result.detectionMethod = 'NOT DETECTED - Content successfully scraped';
        result.warning = `WordPress plugin did not block this request. Expected score: ${analysis.score}/40 (would detect), but Firecrawl got full content.`;
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      {
        success: false,
        blocked: false,
        error: 'Test failed: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Simulate the WordPress plugin's heuristic analysis
function analyzeResponse(response: any): { score: number; details: string[] } {
  let score = 0;
  const details: string[] = [];

  // Check for datacenter IP (simulated - Firecrawl uses cloud IPs)
  score += 30;
  details.push('Datacenter IP detected (+30)');

  // Check for missing browser headers (Firecrawl API doesn't send these)
  score += 20;
  details.push('Missing Accept-Language (+20)');

  score += 15;
  details.push('Missing Accept-Encoding (+15)');

  // No cookies on API requests
  score += 20;
  details.push('No cookies (+20)');

  return { score, details };
}
