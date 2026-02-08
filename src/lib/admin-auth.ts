import { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-session";

// Admin auth: allow if Authorization header matches ADMIN_API_KEY
// OR if admin_session cookie contains a valid signed token.
export function isAdminAuthenticated(req: NextRequest): boolean {
  try {
    // Check Bearer token
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
    if (bearer && bearer === process.env.ADMIN_API_KEY) return true;

    // Check signed session cookie
    const sessionToken = req.cookies.get("admin_session")?.value;
    if (sessionToken && verifyAdminSessionToken(sessionToken)) return true;
  } catch {}
  return false;
}

export function isAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get("admin_session")?.value;
  return token ? verifyAdminSessionToken(token) : false;
}
