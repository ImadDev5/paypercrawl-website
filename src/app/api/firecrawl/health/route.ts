import { NextResponse } from "next/server";
import { crawlSampleDomain, firecrawlAvailable } from "@/lib/firecrawl";

export async function GET() {
  const available = firecrawlAvailable();
  if (!available) {
    return NextResponse.json({ ok: false, available, reason: "missing_api_or_sdk" }, { status: 200 });
  }
  // Use a very small crawl on a deterministic domain to sanity-check
  const sample = await crawlSampleDomain("example.com", 3);
  return NextResponse.json({ ok: true, available, sample });
}
