import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

// ===== Zod Schemas =====

const FiltersSchema = z
  .object({
    connector: z.string().optional(),
    entityType: z.string().optional(),
    sku: z.string().optional(),
    productId: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

const ToolQuerySchema = z.object({
  siteUrl: z.string().url(),
  question: z.string().optional(),
  mode: z.enum(["live_only", "hybrid", "kb_only"]).default("hybrid"),
  freshnessSeconds: z.number().int().positive().default(900), // 15 minutes default
  filters: FiltersSchema.optional(),
  limit: z.number().int().positive().max(100).default(10),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Extract API key from header
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing x-api-key header" },
        { status: 401 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const parseResult = ToolQuerySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    // Normalize siteUrl: strip trailing slash to prevent mismatch
    data.siteUrl = data.siteUrl.replace(/\/+$/, '');
    const sb = getSupabaseAdmin();

    // 3. Validate API key
    const { data: apiKeyRecord, error: keyError } = await sb
      .from("api_keys")
      .select("*")
      .eq("key", apiKey)
      .maybeSingle();

    if (keyError) {
      console.error("API key lookup error:", keyError);
    }

    if (!apiKeyRecord || !apiKeyRecord.active) {
      // Log failed query
      await logQuery({
        apiKeyId: null,
        siteId: null,
        mode: data.mode,
        question: data.question,
        filters: data.filters,
        status: "error",
        errorMessage: "Invalid or inactive API key",
        latencyMs: Date.now() - startTime,
        resultCount: 0,
      });

      return NextResponse.json(
        { success: false, error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // 4. Find the site (scoped to this API key's owner for security)
    const { data: site, error: siteError } = await sb
      .from("sites")
      .select("*")
      .eq("url", data.siteUrl)
      .eq("userId", apiKeyRecord.userId)
      .maybeSingle();

    if (siteError) {
      console.error("Site lookup error:", siteError);
    }

    if (!site) {
      await logQuery({
        apiKeyId: apiKeyRecord.id,
        siteId: null,
        mode: data.mode,
        question: data.question,
        filters: data.filters,
        status: "error",
        errorMessage: "Site not found",
        latencyMs: Date.now() - startTime,
        resultCount: 0,
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Site not found. Ensure Live Sync is enabled and data has been ingested.",
        },
        { status: 404 }
      );
    }

    // 5. Get connectors for this site (optionally filtered by type)
    let connectorQuery = sb
      .from("live_connectors")
      .select("*")
      .eq("siteId", site.id);

    if (data.filters?.connector) {
      connectorQuery = connectorQuery.eq("type", data.filters.connector);
    }

    const { data: connectors, error: connectorError } = await connectorQuery;
    if (connectorError) {
      console.error("Connector lookup error:", connectorError);
    }
    const connectorIds = (connectors || []).map((c: { id: string }) => c.id);
    const connectorMap = Object.fromEntries(
      (connectors || []).map((c: { id: string }) => [c.id, c])
    );

    // 6. Build query for live snapshots
    const freshnessThreshold = new Date(
      Date.now() - data.freshnessSeconds * 1000
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let liveResults: any[] = [];

    if (data.mode !== "kb_only" && connectorIds.length > 0) {
      let snapQuery = sb
        .from("live_entity_snapshots")
        .select("*")
        .in("connectorId", connectorIds)
        .gte("occurredAt", freshnessThreshold.toISOString())
        .order("occurredAt", { ascending: false })
        .limit(data.limit);

      // Apply filters
      if (data.filters?.entityType) {
        snapQuery = snapQuery.eq("entityType", data.filters.entityType);
      }
      if (data.filters?.sku) {
        snapQuery = snapQuery.eq("entityId", data.filters.sku);
      } else if (data.filters?.productId) {
        snapQuery = snapQuery.eq("entityId", String(data.filters.productId));
      }

      const { data: snapshots, error: snapError } = await snapQuery;
      if (snapError) {
        console.error("Snapshot query error:", snapError);
      }
      liveResults = (snapshots || []).map((s: { connectorId: string }) => ({
        ...s,
        connector: connectorMap[s.connectorId],
      }));
    }

    // 7. Optionally query static KB (hybrid mode)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let kbResults: any[] = [];

    if (data.mode === "hybrid" || data.mode === "kb_only") {
      // Simple keyword search over scraped pages if question provided
      if (data.question) {
        const escapedQ = data.question.replace(/%/g, "\\%");
        const { data: kbData, error: kbError } = await sb
          .from("scraped_pages")
          .select("*")
          .eq("siteId", site.id)
          .or(`title.ilike.%${escapedQ}%,contentToon.ilike.%${escapedQ}%`)
          .limit(5);
        if (kbError) {
          console.error("KB query error:", kbError);
        }
        kbResults = kbData || [];
      }
    }

    // 8. Build response
    const latencyMs = Date.now() - startTime;

    // Build answer from live results
    const answerParts: string[] = [];
    const answerData: Record<string, unknown>[] = [];
    const citations: {
      type: "live" | "kb";
      connector?: string;
      occurredAt?: string;
      entityId?: string;
      url?: string;
      title?: string;
    }[] = [];

    for (const snapshot of liveResults) {
      // Build human-readable text
      if (snapshot.entityType === "product") {
        const stockInfo =
          snapshot.stockQuantity != null
            ? `${snapshot.stockStatus} (qty ${snapshot.stockQuantity})`
            : snapshot.stockStatus || "unknown";

        answerParts.push(
          `${snapshot.entityId} (${snapshot.name || "Unknown"}): ${snapshot.currency || "USD"} ${snapshot.price?.toFixed(2) || "N/A"}, ${stockInfo}`
        );
      } else {
        answerParts.push(
          `${snapshot.entityType} ${snapshot.entityId}: ${snapshot.name || "data available"}`
        );
      }

      // Structured data
      answerData.push({
        entityType: snapshot.entityType,
        entityId: snapshot.entityId,
        name: snapshot.name,
        currency: snapshot.currency,
        price: snapshot.price,
        stockStatus: snapshot.stockStatus,
        stockQuantity: snapshot.stockQuantity,
        permalink: snapshot.permalink,
        data: snapshot.data,
      });

      // Citation
      citations.push({
        type: "live",
        connector: snapshot.connector?.type,
        occurredAt: snapshot.occurredAt,
        entityId: snapshot.entityId,
      });
    }

    // Add KB context if in hybrid mode and we have results
    for (const page of kbResults) {
      citations.push({
        type: "kb",
        url: page.url,
        title: page.title || undefined,
      });
    }

    // Log successful query
    await logQuery({
      apiKeyId: apiKeyRecord.id,
      siteId: site.id,
      mode: data.mode,
      question: data.question,
      filters: data.filters,
      status: "success",
      latencyMs,
      resultCount: liveResults.length + kbResults.length,
    });

    return NextResponse.json({
      success: true,
      answer: {
        text:
          answerParts.length > 0
            ? answerParts.join("\n")
            : "No live data found within the freshness window.",
        data: answerData,
      },
      citations,
      meta: {
        mode: data.mode,
        freshnessSeconds: data.freshnessSeconds,
        freshnessThreshold: freshnessThreshold.toISOString(),
        liveResultCount: liveResults.length,
        kbResultCount: kbResults.length,
        latencyMs,
      },
    });
  } catch (error) {
    console.error("Tool query error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to log queries
async function logQuery(params: {
  apiKeyId: string | null;
  siteId: string | null;
  mode: string;
  question?: string;
  filters?: object;
  status: string;
  errorMessage?: string;
  latencyMs: number;
  resultCount: number;
}) {
  try {
    const sb = getSupabaseAdmin();
    await sb.from("tool_query_logs").insert({
      apiKeyId: params.apiKeyId,
      siteId: params.siteId,
      mode: params.mode,
      question: params.question,
      filters: params.filters,
      status: params.status,
      errorMessage: params.errorMessage,
      latencyMs: params.latencyMs,
      resultCount: params.resultCount,
    });
  } catch (err) {
    console.error("Failed to log query:", err);
  }
}
