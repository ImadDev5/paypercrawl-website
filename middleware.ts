import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add CORS headers for API routes
  const response = NextResponse.next();
  
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  // Get the invite token from cookies
  const inviteToken = request.cookies.get("invite_token")?.value;
  // Detect Firebase session cookies (set by Firebase Auth in some environments)
  const hasFirebaseSession =
    Boolean(request.cookies.get("__session")?.value) ||
    Boolean(request.cookies.get("firebase:host")?.value) ||
    Boolean(request.cookies.get("g_state")?.value);

  // Special handling for dashboard route
  if (pathname === "/dashboard") {
    // Check for token in URL params (for new invitations) or cookies
    const urlToken = request.nextUrl.searchParams.get("token");
    const tokenToUse = urlToken || inviteToken;

    // If no token and no firebase session, redirect to waitlist
    if (!tokenToUse && !hasFirebaseSession) {
      return NextResponse.redirect(new URL("/waitlist", request.url));
    }

    // If token comes from URL, store it in cookie then continue
    if (urlToken) {
      response.cookies.set("invite_token", urlToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  }

  // For protected routes under /dashboard, allow if invite cookie or firebase session is present
  if (pathname.startsWith("/dashboard") && !(inviteToken || hasFirebaseSession)) {
    return NextResponse.redirect(new URL("/waitlist", request.url));
  }

  // Handle a client-side signout helper route to clear cookie at edge
  if (pathname === "/api/auth/signout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("invite_token", "", { path: "/", maxAge: 0 });
    return res;
  }

  // For all other routes, just continue - the user stays "logged in"
  // The authentication state is preserved in the cookie
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
  "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
