import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/auth/callback
 *
 * Supabase redirects here after Google OAuth.  The URL contains a `code`
 * query-parameter that we exchange for a session.  We use @supabase/ssr
 * so the PKCE code_verifier (stored as a cookie by the browser client)
 * is available server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/waitlist?error=no_code", origin));
  }

  // We need to build a Response first so the server client can read/write cookies
  const response = NextResponse.redirect(new URL("/dashboard", origin));

  // Create a server-side Supabase client that reads & writes cookies on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData?.user?.email) {
    console.error("[AUTH CALLBACK] Code exchange failed:", sessionError);
    return NextResponse.redirect(
      new URL("/waitlist?error=exchange_failed", origin)
    );
  }

  const email = sessionData.user.email;

  // ----- Waitlist / invite-token logic -----
  const sb = getSupabaseAdmin();

  const { data: waitlistEntry, error: fetchErr } = await sb
    .from("waitlist_entries")
    .select("*")
    .eq("email", email)
    .single();

  if (fetchErr || !waitlistEntry) {
    return NextResponse.redirect(
      new URL("/waitlist?error=not_on_waitlist", origin)
    );
  }

  if (waitlistEntry.status === "pending") {
    return NextResponse.redirect(
      new URL("/waitlist?status=pending", origin)
    );
  }

  if (waitlistEntry.status === "rejected") {
    return NextResponse.redirect(
      new URL("/waitlist?status=rejected", origin)
    );
  }

  if (
    waitlistEntry.status === "invited" ||
    waitlistEntry.status === "accepted"
  ) {
    let inviteToken = waitlistEntry.inviteToken;

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
      const { randomBytes } = await import("crypto");
      inviteToken = randomBytes(32).toString("hex");
      await sb
        .from("waitlist_entries")
        .update({ inviteToken })
        .eq("id", waitlistEntry.id);
    }

    // Set the invite_token cookie and redirect to the dashboard
    // (response already points to /dashboard from above)
    response.cookies.set("invite_token", inviteToken, {
      httpOnly: false, // must be false so client JS (dashboard layout, AuthContext) can read it
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  }

  // Unknown status
  return NextResponse.redirect(new URL("/contact?error=invalid_status", origin));
}
