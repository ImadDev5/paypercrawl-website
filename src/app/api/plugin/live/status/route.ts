import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    // 1. Extract API key from header
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing x-api-key header" },
        { status: 401 }
      );
    }

    const sb = getSupabaseAdmin();

    // 2. Validate API key
    const { data: apiKeyRecord } = await sb
      .from("api_keys")
      .select("*")
      .eq("key", apiKey)
      .single();

    if (!apiKeyRecord || !apiKeyRecord.active) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // 3. Get site URL from query param
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get("siteUrl");

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: "Missing siteUrl parameter" },
        { status: 400 }
      );
    }

    // 4. Find site
    const { data: site } = await sb
      .from("sites")
      .select("*")
      .eq("url", siteUrl)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({
        success: true,
        data: {
          registered: false,
          message:
            "Site not registered. Enable Live Sync and send your first event.",
        },
      });
    }

    // 5. Get connectors for this site
    const { data: connectors } = await sb
      .from("live_connectors")
      .select("id, type, status, lastEventAt, eventCount, lastError, lastErrorAt, createdAt")
      .eq("siteId", site.id);

    // 6. Get snapshot counts per connector
    const connectorStats = await Promise.all(
      (connectors || []).map(async (connector) => {
        const { count: snapshotCount } = await sb
          .from("live_entity_snapshots")
          .select("*", { count: "exact", head: true })
          .eq("connectorId", connector.id);

        const gte24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: recentEventCount } = await sb
          .from("live_events")
          .select("*", { count: "exact", head: true })
          .eq("connectorId", connector.id)
          .gte("occurredAt", gte24h);

        return {
          ...connector,
          snapshotCount: snapshotCount || 0,
          eventsLast24h: recentEventCount || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        registered: true,
        siteId: site.id,
        siteName: site.name,
        connectors: connectorStats,
      },
    });
  } catch (error) {
    console.error("Live status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
