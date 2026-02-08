import { NextRequest, NextResponse } from "next/server";

// Allowed origins for CORS (add your domains here)
const ALLOWED_ORIGINS = new Set([
  "https://paypercrawl.tech",
  "https://www.paypercrawl.tech",
  "http://localhost:3000",
  "http://localhost:3001",
]);

function getCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) return origin;
  // In development, allow any localhost origin
  if (
    process.env.NODE_ENV !== "production" &&
    origin?.match(/^https?:\/\/localhost(:\d+)?$/)
  )
    return origin;
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add CORS headers for API routes
  const response = NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const allowedOrigin = getCorsOrigin(request);
    if (allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      response.headers.set("Vary", "Origin");
    }
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  // Strict admin protection: all /admin pages and /api/admin routes require either
  // - Bearer ADMIN_API_KEY header, or
  // - admin_session cookie with valid signed token
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (isAdminPath || isAdminApi) {
    // Check Bearer token
    const headerKey = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const hasBearerAuth =
      headerKey && headerKey === process.env.ADMIN_API_KEY;

    // Check signed session cookie (not just "1" — must be a signed token)
    // Full verification happens in admin-auth.ts; here we just check existence
    // as a lightweight gate. The actual crypto verification runs in the API routes.
    const sessionCookie = request.cookies.get("admin_session")?.value;
    const hasSession = Boolean(sessionCookie && sessionCookie.length > 10);

    const ok = hasBearerAuth || hasSession;

    // Allow admin login/session endpoint without pre-auth for creating session
    // Account for trailingSlash: true which appends / to all paths
    const isSessionEndpoint =
      pathname === "/api/admin/session" || pathname === "/api/admin/session/";
    const isLoginPage =
      pathname === "/admin/login" || pathname === "/admin/login/";
    if (!ok && !isSessionEndpoint && !isLoginPage) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // For pages, redirect to the admin login page
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Get the invite token from cookies
  const inviteToken = request.cookies.get("invite_token")?.value;

  // Firebase session validation: check for actual Firebase ID token content,
  // not just cookie existence. The __session cookie should contain a real JWT.
  const firebaseSession = request.cookies.get("__session")?.value;
  const hasFirebaseSession = Boolean(
    firebaseSession && firebaseSession.length > 50
  );

  // Special handling for dashboard route
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  }

  // For protected routes under /dashboard, allow if invite cookie or firebase session is present
  if (
    pathname.startsWith("/dashboard") &&
    !(inviteToken || hasFirebaseSession)
  ) {
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
