import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendBetaInvite } from "@/lib/email";
import { generateInviteToken } from "@/lib/utils";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function verifyAdminAuth(request: NextRequest): boolean {
  return isAdminAuthenticated(request);
}

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const sb = getSupabaseAdmin();

    let query = sb
      .from("waitlist_entries")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search?.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,website.ilike.%${search.trim()}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[ADMIN WAITLIST] Supabase error:", error.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // DB columns are already camelCase (Prisma convention)
    const waitlistEntries = data ?? [];

    const total = count ?? 0;

    return NextResponse.json({
      waitlistEntries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[ADMIN WAITLIST] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, email, emails } = body;
    const sb = getSupabaseAdmin();

    if (action === "invite") {
      if (email) {
        // Single invite
        const { data: entry, error: fetchErr } = await sb
          .from("waitlist_entries")
          .select("*")
          .eq("email", email)
          .single() as { data: any; error: any };

        if (fetchErr || !entry) {
          return NextResponse.json({ error: "Email not found on waitlist" }, { status: 404 });
        }
        if (entry.status === "invited") {
          return NextResponse.json({ error: "User already invited" }, { status: 400 });
        }

        const inviteToken = entry.inviteToken || generateInviteToken();

        const { data: updated, error: updateErr } = await sb
          .from("waitlist_entries")
          .update({ status: "invited", inviteToken: inviteToken, invitedAt: new Date().toISOString() } as any)
          .eq("email", email)
          .select()
          .single() as { data: any; error: any };

        if (updateErr) {
          return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
        }

        try {
          await sendBetaInvite(email, entry.name, inviteToken);
        } catch (emailError) {
          console.error("Failed to send beta invite:", emailError);
        }

        return NextResponse.json({ message: "Beta invite sent successfully", entry: updated });

      } else if (emails && Array.isArray(emails)) {
        // Bulk invite
        const results: any[] = [];

        for (const emailAddr of emails) {
          try {
            const { data: entry, error: fetchErr } = await sb
              .from("waitlist_entries")
              .select("*")
              .eq("email", emailAddr)
              .single() as { data: any; error: any };

            if (fetchErr || !entry || entry.status === "invited") continue;

            const inviteToken = entry.inviteToken || generateInviteToken();

            await sb
              .from("waitlist_entries")
              .update({ status: "invited", inviteToken: inviteToken, invitedAt: new Date().toISOString() } as any)
              .eq("email", emailAddr);

            try {
              await sendBetaInvite(emailAddr, entry.name, inviteToken);
              results.push({ email: emailAddr, success: true });
            } catch {
              results.push({ email: emailAddr, success: false, error: "Email failed" });
            }
          } catch {
            results.push({ email: emailAddr, success: false, error: "Database error" });
          }
        }

        return NextResponse.json({ message: "Bulk invite completed", results });
      }
    }

    return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 });
  } catch (err) {
    console.error("[ADMIN WAITLIST] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
