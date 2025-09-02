import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface GoogleAuthRequest {
  email: string;
  name: string;
  photoURL?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleAuthRequest = await request.json();
    const { email, name, photoURL } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user exists in waitlist
    const waitlistEntry = await db.waitlistEntry.findUnique({
      where: { email },
    });

    if (!waitlistEntry) {
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
      // User is on waitlist but not yet approved - return 403
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
      // Update to accepted if currently invited
      if (waitlistEntry.status === "invited") {
        await db.waitlistEntry.update({
          where: { id: waitlistEntry.id },
          data: { status: "accepted" },
        });
      }

      // Return success with user data and invite token
      return NextResponse.json({
        success: true,
        user: {
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          website: waitlistEntry.website,
        },
        inviteToken: waitlistEntry.inviteToken,
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
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}