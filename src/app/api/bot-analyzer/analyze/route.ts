import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { gunzipSync } from "node:zlib";
import { crawlSampleDomain, firecrawlAvailable } from "@/lib/firecrawl";

// 1) Crawlers list
const AI_CRAWLERS = [
  { name: "GPTBot", company: "OpenAI", userAgent: "GPTBot" },
  { name: "ChatGPT-User", company: "OpenAI", userAgent: "ChatGPT-User" },
  { name: "ClaudeBot", company: "Anthropic", userAgent: "ClaudeBot" },
  { name: "Claude-Web", company: "Anthropic", userAgent: "Claude-Web" },
  { name: "anthropic-ai", company: "Anthropic", userAgent: "anthropic-ai" },
  { name: "PerplexityBot", company: "Perplexity", userAgent: "PerplexityBot" },
  { name: "Google-Extended", company: "Google", userAgent: "Google-Extended" },
  { name: "GoogleOther", company: "Google", userAgent: "GoogleOther" },
  { name: "GoogleOther-Image", company: "Google", userAgent: "GoogleOther-Image" },
  { name: "FacebookBot", company: "Meta", userAgent: "FacebookBot" },
  { name: "Meta-Extended", company: "Meta", userAgent: "Meta-Extended" },
  { name: "Applebot-Extended", company: "Apple", userAgent: "Applebot-Extended" },
  { name: "Amazonbot", company: "Amazon", userAgent: "Amazonbot" },
  { name: "CCBot", company: "Common Crawl", userAgent: "CCBot" },
  { name: "Omgilibot", company: "Omgili", userAgent: "Omgilibot" },
  { name: "Bytespider", company: "ByteDance", userAgent: "Bytespider" },
  { name: "Diffbot", company: "Diffbot", userAgent: "Diffbot" },
  { name: "cohere-ai", company: "Cohere", userAgent: "cohere-ai" },
  { name: "YouBot", company: "You.com", userAgent: "YouBot" },
  { name: "Ai2Bot", company: "AllenAI", userAgent: "Ai2Bot" },
];

const REQUEST_HEADERS = {
  "User-Agent": "PayPerCrawl-Analyzer/1.1 (+https://paypercrawl.com)",
  Accept: "*/*",
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
});

// 2) Helpers
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  normalized = normalized.replace(/^https?:\/\//, "");
  normalized = normalized.replace(/^www\./, "");
  normalized = normalized.replace(/\/$/, "");
  return normalized;
}

type RobotsGroup = { agents: string[]; allow: string[]; disallow: string[] };

function parseRobotsTxt(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  const sitemaps: string[] = [];

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!key || !value) continue;

    if (key === "user-agent") {
      if (!current || current.allow.length || current.disallow.length) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value);
    } else if (key === "allow") {
      if (!current) {
        current = { agents: ["*"], allow: [], disallow: [] };
        groups.push(current);
      }
      current.allow.push(value);
    } else if (key === "disallow") {
      if (!current) {
        current = { agents: ["*"], allow: [], disallow: [] };
        groups.push(current);
      }
      current.disallow.push(value);
    } else if (key === "sitemap") {
      sitemaps.push(value);
    }
  }

  return { groups, sitemaps };
}

function matchGroupForUA(groups: RobotsGroup[], ua: string): RobotsGroup | null {
  const uaLower = ua.toLowerCase();
  let best: RobotsGroup | null = null;
  for (const g of groups) {
    if (g.agents.some((a) => a.toLowerCase() === uaLower)) return g;
  }
  best = groups.find((g) => g.agents.some((a) => a.trim() === "*")) || null;
  return best;
}

function isBlockedByGroup(group: RobotsGroup): boolean {
  const disallowsAll = group.disallow.some((p) => p.trim() === "/" || p.trim() === "/*");
  const allowsAll = group.allow.some((p) => p.trim() === "/");
  if (disallowsAll && !allowsAll) return true;
  return false;
}

async function fetchTextOrBuffer(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, { headers: REQUEST_HEADERS, cache: "no-store", signal: controller.signal });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (url.endsWith(".gz") || ct.includes("gzip")) {
      const buf = Buffer.from(await res.arrayBuffer());
      try {
        const unzipped = gunzipSync(buf);
        return unzipped.toString("utf8");
      } catch {
        return buf.toString("utf8");
      }
    }
    return await res.text();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function ensureAbsolute(url: string, domain: string) {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://${domain}${url}`;
  return `https://${domain}/${url}`;
}

function countUrlsFromXml(xml: any): number {
  if (!xml) return 0;
  if (xml.urlset) {
    const urls = xml.urlset.url;
    if (!urls) return 0;
    return Array.isArray(urls) ? urls.length : 1;
  }
  const rootKey = Object.keys(xml).find((k) => k.toLowerCase().includes("urlset"));
  if (rootKey && xml[rootKey]) {
    const urls = xml[rootKey].url;
    if (!urls) return 0;
    return Array.isArray(urls) ? urls.length : 1;
  }
  return 0;
}

function extractSitemapsFromIndex(xml: any): string[] {
  if (!xml) return [];
  const key = Object.keys(xml).find((k) => k.toLowerCase().includes("sitemapindex"));
  const node = key ? xml[key] : null;
  if (!node) return [];
  const entries = node.sitemap;
  if (!entries) return [];
  const arr = Array.isArray(entries) ? entries : [entries];
  return arr
    .map((e) => (typeof e.loc === "string" ? e.loc : e.loc?.["#text"] || e.loc))
    .filter(Boolean) as string[];
}

// 3) Analyzers
async function analyzeRobotsTxt(domain: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`https://${domain}/robots.txt`, {
      headers: REQUEST_HEADERS,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        exists: false,
        allowsAIBots: true,
        blockedBots: [] as string[],
        allowedBots: AI_CRAWLERS.map((c) => c.name),
        sitemaps: [] as string[],
      };
    }

    const text = await response.text();
    const { groups, sitemaps } = parseRobotsTxt(text);
    const blockedBots: string[] = [];
    const allowedBots: string[] = [];

    for (const crawler of AI_CRAWLERS) {
      const group = matchGroupForUA(groups, crawler.userAgent);
      if (group) {
        if (isBlockedByGroup(group)) blockedBots.push(crawler.name);
        else allowedBots.push(crawler.name);
      } else {
        allowedBots.push(crawler.name);
      }
    }

    return {
      exists: true,
      allowsAIBots: allowedBots.length > 0,
      blockedBots,
      allowedBots,
      sitemaps,
    };
  } catch (error) {
    console.error("Error fetching robots.txt:", error);
    return {
      exists: false,
      allowsAIBots: true,
      blockedBots: [] as string[],
      allowedBots: AI_CRAWLERS.map((c) => c.name),
      sitemaps: [] as string[],
    };
  }
}

async function analyzeSitemap(domain: string, robotsSitemaps: string[] = []) {
  try {
    const candidates = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://${domain}/sitemap-index.xml`,
      `https://${domain}/sitemap1.xml`,
      `https://${domain}/sitemap.txt`,
      ...robotsSitemaps.map((u) => ensureAbsolute(u, domain)),
    ];
    const seen = new Set<string>();
    const toTry = candidates.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));

    let totalUrls = 0;
    let foundAny = false;
    let isEstimate = false;
    const SUB_SITEMAP_FETCH_LIMIT = 15;

    for (const url of toTry) {
      let body: string | null = null;
      try { body = await fetchTextOrBuffer(url); } catch { body = null; }
      if (!body) continue;
      foundAny = true;

      if (url.endsWith(".txt")) {
        totalUrls += body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length;
        continue;
      }

      const xml = parser.parse(body);
      const count = countUrlsFromXml(xml);
      if (count > 0) {
        totalUrls += count;
        continue;
      }

      const subSitemaps = extractSitemapsFromIndex(xml);
      if (subSitemaps.length) {
        const absSub = subSitemaps.map((s) => ensureAbsolute(String(s), domain));
        const limited = absSub.slice(0, SUB_SITEMAP_FETCH_LIMIT);
        let fetchedCount = 0;
        let sumUrls = 0;
        for (const sub of limited) {
          let subBody: string | null = null;
          try { subBody = await fetchTextOrBuffer(sub); } catch { subBody = null; }
          if (!subBody) continue;
          const subXml = parser.parse(subBody);
          const subCount = countUrlsFromXml(subXml);
          if (subCount > 0) {
            sumUrls += subCount;
            fetchedCount += 1;
          }
        }
        if (fetchedCount > 0) {
          if (absSub.length > fetchedCount) {
            const avg = sumUrls / fetchedCount;
            totalUrls += Math.round(avg * absSub.length);
            isEstimate = true;
          } else {
            totalUrls += sumUrls;
          }
        } else {
          totalUrls += absSub.length * 500;
          isEstimate = true;
        }
      }
    }

    return {
      exists: foundAny,
      pageCount: totalUrls,
      urls: [] as string[],
      estimated: isEstimate,
    };
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return {
      exists: false,
      pageCount: 0,
      urls: [] as string[],
      estimated: true,
    };
  }
}

async function detectTechStack(domain: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`https://${domain}`, {
      headers: REQUEST_HEADERS,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await response.text();
    const headers = response.headers;

    let platform = "Unknown";
    let hasProtection = false;
    const indicators: string[] = [];

    if (
      /wp-content|wp-includes/i.test(text) ||
      /<meta\s+name=["']generator["']\s+content=["']WordPress/i.test(text) ||
      headers.get("x-redirect-by")?.toLowerCase().includes("wordpress")
    ) {
      platform = "WordPress";
      indicators.push("WordPress markers");
    } else if (/\/\_next\//.test(text) || headers.get("x-powered-by")?.includes("Next.js")) {
      platform = "Next.js";
      indicators.push("Next.js assets");
    } else if (/react|__NEXT_DATA__/i.test(text)) {
      platform = "React";
      indicators.push("React markers");
    } else if (/Shopify/i.test(text)) {
      platform = "Shopify";
      indicators.push("Shopify");
    } else if (/Wix|wixStatic/i.test(text)) {
      platform = "Wix";
      indicators.push("Wix");
    } else if (/squarespace/i.test(text)) {
      platform = "Squarespace";
      indicators.push("Squarespace");
    }

    const serverHeader = headers.get("server")?.toLowerCase() || "";
    if (headers.get("x-crawlguard")) indicators.push("CrawlGuard header");
    if (headers.get("x-robots-tag")?.toLowerCase().includes("noai")) indicators.push("X-Robots-Tag noai");
    if (/crawlguard/i.test(text)) indicators.push("CrawlGuard mention");
    if (serverHeader.includes("cloudflare") || headers.get("cf-ray")) indicators.push("Cloudflare");
    if (headers.get("x-cache")?.toLowerCase().includes("varnish")) indicators.push("Varnish");
    if (headers.get("x-amz-cf-id") || headers.get("x-cache")?.toLowerCase().includes("cloudfront")) indicators.push("CloudFront");

    hasProtection = indicators.length > 0;

    return { platform, hasProtection, indicators };
  } catch (error) {
    console.error("Error detecting tech stack:", error);
    return { platform: "Unknown", hasProtection: false, indicators: [] as string[] };
  }
}

function calculateEstimates(pageCount: number, allowsAIBots: boolean, hasNewsSignals: boolean) {
  let baseRequestsPerPage = 1.0;
  if (hasNewsSignals) baseRequestsPerPage = 3.0;
  else if (pageCount > 10000) baseRequestsPerPage = 1.8;
  else if (pageCount > 1000) baseRequestsPerPage = 1.3;
  const botTrafficPercentage = allowsAIBots ? 35 : 10;
  const monthlyBotRequests = Math.round(pageCount * baseRequestsPerPage);
  const estimatedMonthlyCost = Math.round((monthlyBotRequests / 1000) * 0.5);
  return { monthlyBotRequests, botTrafficPercentage, estimatedMonthlyCost };
}

function calculateRiskScore(
  allowsAIBots: boolean,
  pageCount: number,
  hasProtection: boolean
): "low" | "medium" | "high" | "critical" {
  let score = 0;
  if (allowsAIBots) score += 3;
  if (pageCount > 10000) score += 3;
  else if (pageCount > 1000) score += 2;
  else if (pageCount > 100) score += 1;
  if (!hasProtection) score += 2;
  if (score >= 7) return "critical";
  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

// 4) Handler
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }
    const domain = normalizeUrl(url);

    const robotsTxt = await analyzeRobotsTxt(domain);
    const [sitemap, techStack] = await Promise.all([
      analyzeSitemap(domain, robotsTxt.sitemaps || []),
      detectTechStack(domain),
    ]);

    // Optional Firecrawl enhancement: small sample crawl to reduce estimation
    let firecrawlSample: any = null;
    if (firecrawlAvailable()) {
      firecrawlSample = await crawlSampleDomain(domain, 30);
      // If we didn't find any sitemap but firecrawl discovered pages, infer existence and adjust estimates downwards from guessy heuristics
      if ((!sitemap.exists || sitemap.pageCount === 0) && firecrawlSample.success && firecrawlSample.discoveredCount > 0) {
        // We only use discovered count as a floor signal to avoid overestimation
        sitemap.exists = true;
        if (sitemap.pageCount < firecrawlSample.discoveredCount) {
          sitemap.pageCount = firecrawlSample.discoveredCount;
          sitemap.estimated = true; // still an estimate, but now data-backed
        }
      }
    }

    const hasNewsSignals = (robotsTxt.sitemaps || []).some((u: string) => /news|latest/i.test(u));
    const estimates = calculateEstimates(sitemap.pageCount || 100, robotsTxt.allowsAIBots, hasNewsSignals);
    const riskScore = calculateRiskScore(robotsTxt.allowsAIBots, sitemap.pageCount || 100, techStack.hasProtection);

    const aiCrawlers = AI_CRAWLERS.map((crawler) => ({
      name: crawler.name,
      allowed: robotsTxt.allowedBots.includes(crawler.name),
      company: crawler.company,
    }));

    const result = { domain, riskScore, robotsTxt, sitemap, techStack, estimates, aiCrawlers, firecrawl: firecrawlSample };
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error analyzing website:", error);
    return NextResponse.json({ success: false, error: "Failed to analyze website" }, { status: 500 });
  }
}
// End of analyzer route
