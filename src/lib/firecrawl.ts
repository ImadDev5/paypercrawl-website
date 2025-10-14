// Lightweight wrapper around Firecrawl to keep our API usage in one place
// Falls back gracefully when API key is missing or Firecrawl is unavailable
import type { IncomingHttpHeaders } from "http";

let FirecrawlApp: any | null = null;
try {
  // Lazy import so local dev without the package installed doesn't hard-crash
  // The package will be added to dependencies; this is extra safety.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FirecrawlApp = require("@mendable/firecrawl-js").default || require("@mendable/firecrawl-js");
} catch {
  FirecrawlApp = null;
}

type CrawlSampleResult = {
  success: boolean;
  reason?: string;
  discoveredCount: number;
  discoveredUrls: string[];
  // high-level tags/topics detected from content heuristics
  topics?: string[];
};

function getApiKey(): string | undefined {
  // Accept both uppercase and lowercase env keys to be forgiving
  const key = process.env.FIRECRAWL_API_KEY || (process.env as any).firecrawl_api_key;
  if (typeof key === "string" && key.trim().length > 0) return key.trim();
  return undefined;
}

function hasApiKey() {
  return !!getApiKey();
}

export async function crawlSampleDomain(domain: string, limit = 30): Promise<CrawlSampleResult> {
  if (!hasApiKey()) {
    return { success: false, reason: "missing_api_key", discoveredCount: 0, discoveredUrls: [] };
  }
  if (!FirecrawlApp) {
    return { success: false, reason: "package_not_available", discoveredCount: 0, discoveredUrls: [] };
  }
  try {
    const apiKey = getApiKey();
    if (!apiKey) return { success: false, reason: "missing_api_key", discoveredCount: 0, discoveredUrls: [] };
    const app = new FirecrawlApp({ apiKey });
    const startUrl = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;

    // Firecrawl SDK v4 uses `crawl`; v1 compatibility under `v1.crawlUrl`.
    // Keep limit small for latency/cost control.
    let res: any;
    if (typeof app.crawl === "function") {
      res = await app.crawl(startUrl, {
        limit,
        scrapeOptions: { formats: ["markdown"], timeout: 10000 },
        // pollInterval: 2, // optional waiter, default is fine for small limits
      });
    } else if (app.v1 && typeof app.v1.crawlUrl === "function") {
      res = await app.v1.crawlUrl(startUrl, {
        limit,
        scrapeOptions: { formats: ["markdown"], timeout: 10000 },
      });
    } else {
      return { success: false, reason: "crawl_method_unavailable", discoveredCount: 0, discoveredUrls: [] };
    }

    // Normalize various possible response shapes
    const pages: any[] = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : Array.isArray(res?.pages)
      ? res.pages
      : [];

    const urls: string[] = [];
    const topicsSet = new Set<string>();
    for (const p of pages) {
      const u = typeof p === "string" ? p : p?.url || p?.link || p?.sourceUrl;
      if (u && typeof u === "string") urls.push(u);
      const md: string | undefined = p?.markdown || p?.content || p?.text;
      if (md && typeof md === "string") {
        const lower = md.toLowerCase();
        if (/(news|latest|press|announcement)s?/.test(lower)) topicsSet.add("news");
        if (/(blog|article|post)s?/.test(lower)) topicsSet.add("blog");
        if (/(privacy|policy|terms)/.test(lower)) topicsSet.add("legal");
        if (/(product|pricing|features)/.test(lower)) topicsSet.add("product");
        if (/(docs|documentation|api)/.test(lower)) topicsSet.add("docs");
      }
    }

    const uniqueUrls = Array.from(new Set(urls)).slice(0, limit);
    return {
      success: true,
      discoveredCount: uniqueUrls.length,
      discoveredUrls: uniqueUrls,
      topics: Array.from(topicsSet),
    };
  } catch (e: any) {
    const msg = (e && (e.message || e.toString())) || "unknown_error";
    return { success: false, reason: String(msg), discoveredCount: 0, discoveredUrls: [] };
  }
}

export function firecrawlAvailable() {
  return hasApiKey() && !!FirecrawlApp;
}
