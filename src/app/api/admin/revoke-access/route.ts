import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Verify admin authentication
function verifyAdminAuth(request: NextRequest): boolean {
  return isAdminAuthenticated(request);
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // Find user
    const { data: entry, error: fetchErr } = await sb
      .from("waitlist_entries")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchErr || !entry) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset to pending and clear invite token
    const { data: updated, error: updateErr } = await sb
      .from("waitlist_entries")
      .update({ status: "pending", inviteToken: null, invitedAt: null })
      .eq("email", email)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Access revoked successfully",
      entry: updated,
    });
  } catch (error) {
    console.error("Error revoking access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
