import { NextRequest } from "next/server";

// Simple admin auth: allow if Authorization header matches ADMIN_API_KEY
// OR if an admin session cookie is present (set via /api/admin/session).
export function isAdminAuthenticated(req: NextRequest): boolean {
  try {
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
    if (bearer && bearer === process.env.ADMIN_API_KEY) return true;

    const adminSession = req.cookies.get("admin_session")?.value;
    // Minimal strictness: cookie must be the literal string "1"
    if (adminSession === "1") return true;
  } catch {}
  return false;
}

export function isAdminSession(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}
