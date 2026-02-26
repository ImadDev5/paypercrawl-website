import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

// ===== Zod Schemas =====

const PriceSchema = z.object({
  regular: z.number().optional(),
  sale: z.number().nullable().optional(),
  effective: z.number(),
});

const StockSchema = z.object({
  status: z.enum(["instock", "outofstock", "onbackorder"]),
  quantity: z.number().nullable().optional(),
  backorders: z.string().optional(),
});

const ProductEntitySchema = z.object({
  type: z.literal("product"),
  productId: z.union([z.string(), z.number()]),
  sku: z.string().optional(),
  name: z.string(),
  currency: z.string().default("USD"),
  price: PriceSchema,
  stock: StockSchema,
  permalink: z.string().optional(),
});

// Generic entity schema for future connectors
const GenericEntitySchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const LiveIngestSchema = z.object({
  siteUrl: z.string().url(),
  connector: z.string().min(1),
  eventType: z.string().min(1),
  eventId: z.string().min(1),
  occurredAt: z.string().datetime({ offset: true }),
  entity: z.union([ProductEntitySchema, GenericEntitySchema]),
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
    const parseResult = LiveIngestSchema.safeParse(body);

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
    // Normalize siteUrl: strip trailing slash to prevent mismatch with stored records
    data.siteUrl = data.siteUrl.replace(/\/+$/, '');
    const sb = getSupabaseAdmin();

    // 3. Validate API key and get user
    const { data: apiKeyRecord, error: keyError } = await sb
      .from("api_keys")
      .select("*")
      .eq("key", apiKey)
      .maybeSingle();

    if (keyError) {
      console.error("API key lookup error:", keyError);
    }

    if (!apiKeyRecord || !apiKeyRecord.active) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // 4. Find or create Site (upsert on userId + url composite)
    const { data: existingSite } = await sb
      .from("sites")
      .select("*")
      .eq("userId", apiKeyRecord.userId)
      .eq("url", data.siteUrl)
      .maybeSingle();

    let site;
    if (existingSite) {
      const { data: updated, error: updateErr } = await sb
        .from("sites")
        .update({ apiKey: apiKey, updatedAt: new Date().toISOString() })
        .eq("id", existingSite.id)
        .select()
        .single();
      if (updateErr) {
        console.error("Site update error:", updateErr);
        return NextResponse.json(
          { success: false, error: "Failed to update site: " + updateErr.message },
          { status: 500 }
        );
      }
      site = updated;
    } else {
      const { data: created, error: createErr } = await sb
        .from("sites")
        .insert({
          userId: apiKeyRecord.userId,
          url: data.siteUrl,
          apiKey: apiKey,
          name: new URL(data.siteUrl).hostname,
        })
        .select()
        .single();
      if (createErr) {
        console.error("Site create error:", createErr);
        return NextResponse.json(
          { success: false, error: "Failed to create site: " + createErr.message },
          { status: 500 }
        );
      }
      site = created;
    }

    // 5. Find or create LiveConnector (handle increment manually)
    const { data: existingConnector } = await sb
      .from("live_connectors")
      .select("*")
      .eq("siteId", site.id)
      .eq("type", data.connector)
      .maybeSingle();

    let connector;
    if (existingConnector) {
      const { data: updated, error: updateErr } = await sb
        .from("live_connectors")
        .update({
          lastEventAt: new Date().toISOString(),
          eventCount: (existingConnector.eventCount || 0) + 1,
          status: "active",
          lastError: null,
          lastErrorAt: null,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", existingConnector.id)
        .select()
        .single();
      if (updateErr) {
        console.error("Connector update error:", updateErr);
        return NextResponse.json(
          { success: false, error: "Failed to update connector: " + updateErr.message },
          { status: 500 }
        );
      }
      connector = updated;
    } else {
      const { data: created, error: createErr } = await sb
        .from("live_connectors")
        .insert({
          siteId: site.id,
          type: data.connector,
          name: data.connector.charAt(0).toUpperCase() + data.connector.slice(1),
          status: "active",
          lastEventAt: new Date().toISOString(),
          eventCount: 1,
        })
        .select()
        .single();
      if (createErr) {
        console.error("Connector create error:", createErr);
        return NextResponse.json(
          { success: false, error: "Failed to create connector: " + createErr.message },
          { status: 500 }
        );
      }
      connector = created;
    }

    // 6. Check for duplicate event (idempotency)
    const { data: existingEvent } = await sb
      .from("live_events")
      .select("id")
      .eq("connectorId", connector.id)
      .eq("eventId", data.eventId)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({
        success: true,
        stored: false,
        deduped: true,
        receivedAt: new Date().toISOString(),
      });
    }

    // 7. Extract entity identifiers
    const entity = data.entity;
    const entityType = entity.type;
    const entityId =
      "sku" in entity && entity.sku
        ? String(entity.sku)
        : "productId" in entity
          ? String(entity.productId)
          : "id" in entity
            ? String(entity.id)
            : data.eventId;

    // 8. Create LiveEvent (append-only log)
    const { error: eventInsertErr } = await sb.from("live_events").insert({
      connectorId: connector.id,
      eventId: data.eventId,
      eventType: data.eventType,
      occurredAt: new Date(data.occurredAt).toISOString(),
      payload: entity as object,
      entityType: entityType,
      entityId: entityId,
    });
    if (eventInsertErr) {
      console.error("LiveEvent insert error:", eventInsertErr);
      return NextResponse.json(
        { success: false, error: "Failed to store event: " + eventInsertErr.message },
        { status: 500 }
      );
    }

    // 9. Upsert LiveEntitySnapshot (latest state)
    const snapshotFields: Record<string, unknown> = {
      data: entity as object,
      occurredAt: new Date(data.occurredAt).toISOString(),
    };

    // Extract normalized fields for WooCommerce product
    if (entity.type === "product") {
      const productEntity = entity as z.infer<typeof ProductEntitySchema>;
      snapshotFields.name = productEntity.name;
      snapshotFields.currency = productEntity.currency;
      snapshotFields.price = productEntity.price.effective;
      snapshotFields.stockStatus = productEntity.stock.status;
      if (productEntity.stock.quantity != null) {
        snapshotFields.stockQuantity = productEntity.stock.quantity;
      }
      snapshotFields.permalink = productEntity.permalink;
    }

    // Upsert on composite (connectorId, entityType, entityId)
    const { data: existingSnapshot } = await sb
      .from("live_entity_snapshots")
      .select("id")
      .eq("connectorId", connector.id)
      .eq("entityType", entityType)
      .eq("entityId", entityId)
      .maybeSingle();

    if (existingSnapshot) {
      const { error: snapUpdateErr } = await sb
        .from("live_entity_snapshots")
        .update({ ...snapshotFields, updatedAt: new Date().toISOString() })
        .eq("id", existingSnapshot.id);
      if (snapUpdateErr) {
        console.error("Snapshot update error:", snapUpdateErr);
        return NextResponse.json(
          { success: false, error: "Failed to update snapshot: " + snapUpdateErr.message },
          { status: 500 }
        );
      }
    } else {
      const { error: snapInsertErr } = await sb.from("live_entity_snapshots").insert({
        connectorId: connector.id,
        entityType: entityType,
        entityId: entityId,
        ...snapshotFields,
      });
      if (snapInsertErr) {
        console.error("Snapshot insert error:", snapInsertErr);
        return NextResponse.json(
          { success: false, error: "Failed to store snapshot: " + snapInsertErr.message },
          { status: 500 }
        );
      }
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      stored: true,
      deduped: false,
      receivedAt: new Date().toISOString(),
      latencyMs,
    });
  } catch (error) {
    console.error("Live ingest error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
