import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    const { data: waitlistEntry, error } = await sb
      .from("waitlist_entries")
      .select("*")
      .eq("inviteToken", token)
      .single();

    if (error || !waitlistEntry) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite token" },
        { status: 401 }
      );
    }

    // Check if the user is invited or already accepted
    if (
      waitlistEntry.status !== "invited" &&
      waitlistEntry.status !== "accepted"
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invite has been revoked or is no longer valid",
        },
        { status: 401 }
      );
    }

    // Update status to accepted if this is the first time accessing
    if (waitlistEntry.status === "invited") {
      const { error: updateError } = await sb
        .from("waitlist_entries")
        .update({ status: "accepted" })
        .eq("id", waitlistEntry.id);

      if (updateError) {
        console.error("Failed to update waitlist status:", updateError);
      }
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: waitlistEntry.email,
        name: waitlistEntry.name,
        website: waitlistEntry.website,
      },
    });
  } catch (error) {
    console.error("Error validating invite token:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    const { data: waitlistEntry, error } = await sb
      .from("waitlist_entries")
      .select("*")
      .eq("inviteToken", token)
      .eq("status", "invited")
      .single();

    if (error || !waitlistEntry) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired invite token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: waitlistEntry.email,
        name: waitlistEntry.name,
        website: waitlistEntry.website,
      },
    });
  } catch (error) {
    console.error("Error validating invite token:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
