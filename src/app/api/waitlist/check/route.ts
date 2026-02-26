import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data: waitlistEntry, error } = await sb
      .from("waitlist_entries")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !waitlistEntry) {
      return NextResponse.json({
        exists: false,
        status: null,
        error: "not_on_waitlist"
      }, { status: 404 });
    }

    // Return different status codes based on waitlist status
    if (waitlistEntry.status === "pending") {
      return NextResponse.json({
        exists: true,
        status: waitlistEntry.status,
        name: waitlistEntry.name,
        createdAt: waitlistEntry.createdAt,
        invitedAt: waitlistEntry.invitedAt,
        error: "waitlist_pending"
      }, { status: 403 });
    }

    // For invited, accepted, or rejected status, return normal response
    return NextResponse.json({
      exists: true,
      status: waitlistEntry.status,
      name: waitlistEntry.name,
      createdAt: waitlistEntry.createdAt,
      invitedAt: waitlistEntry.invitedAt,
    });
  } catch (error) {
    console.error("Error checking waitlist status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
