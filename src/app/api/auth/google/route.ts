import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

interface GoogleAuthRequest {
  email: string;
  name: string;
  photoURL?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] Request received');
    const body: GoogleAuthRequest = await request.json();
    console.log('[AUTH] Request body:', JSON.stringify({ email: body?.email, name: body?.name }));
    
    const { email, name, photoURL } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // Check if user exists in waitlist
    const { data: waitlistEntry, error: fetchErr } = await sb
      .from("waitlist_entries")
      .select("*")
      .eq("email", email)
      .single();
    
    console.log('[AUTH] Waitlist check for email:', email);
    console.log('[AUTH] Waitlist entry found:', !!waitlistEntry);
    if (waitlistEntry) {
      console.log('[AUTH] Entry status:', waitlistEntry.status);
    }

    if (fetchErr || !waitlistEntry) {
      // User is not on waitlist - return 404
      return NextResponse.json(
        { 
          error: "not_on_waitlist",
          message: "You need to join our waitlist first to access the dashboard.",
          redirectTo: "/waitlist"
        },
        { status: 404 }
      );
    }

    // Check user status
    if (waitlistEntry.status === "pending") {
      return NextResponse.json(
        {
          error: "waitlist_pending",
          message: "Your application is still being reviewed. You'll receive an email when approved.",
          redirectTo: "/waitlist?status=pending"
        },
        { status: 403 }
      );
    }

    if (waitlistEntry.status === "rejected") {
      return NextResponse.json(
        {
          error: "application_rejected",
          message: "Your application has been reviewed. Please contact support for more information.",
          redirectTo: "/waitlist?status=rejected"
        },
        { status: 403 }
      );
    }

    if (waitlistEntry.status === "invited" || waitlistEntry.status === "accepted") {
      console.log('[AUTH] User authorized! Status:', waitlistEntry.status);
      let inviteToken = waitlistEntry.inviteToken;

      // If they were invited, promote to accepted
      if (waitlistEntry.status === "invited") {
        if (!inviteToken) {
          const { randomBytes } = await import("crypto");
          inviteToken = randomBytes(32).toString("hex");
        }

        await sb
          .from("waitlist_entries")
          .update({ status: "accepted", inviteToken })
          .eq("id", waitlistEntry.id);
      } else if (!inviteToken) {
        // Already accepted but missing token (legacy rows)
        const { randomBytes } = await import("crypto");
        inviteToken = randomBytes(32).toString("hex");
        await sb
          .from("waitlist_entries")
          .update({ inviteToken })
          .eq("id", waitlistEntry.id);
      }
      
      console.log('[AUTH] Success! Returning user data and invite token');

      return NextResponse.json({
        success: true,
        user: {
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          website: waitlistEntry.website,
        },
        inviteToken,
      });
    }

    // Fallback for unknown status
    return NextResponse.json(
      {
        error: "invalid_status",
        message: "Account status is invalid. Please contact support.",
        redirectTo: "/contact"
      },
      { status: 403 }
    );

  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
