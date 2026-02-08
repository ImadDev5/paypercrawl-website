import crypto from "crypto";

/**
 * Signed admin session tokens.
 *
 * Instead of storing a plain "1" in the cookie (which anyone can forge),
 * we sign {ts, nonce} with ADMIN_API_KEY using HMAC-SHA256. The middleware
 * verifies the signature, making the cookie unforgeable without the secret.
 */

const ALGORITHM = "sha256";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const key = process.env.ADMIN_API_KEY;
  if (!key) throw new Error("ADMIN_API_KEY is not set");
  return key;
}

/** Create a signed session token */
export function createAdminSessionToken(): string {
  const payload = JSON.stringify({
    ts: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  });
  const sig = crypto
    .createHmac(ALGORITHM, getSecret())
    .update(payload)
    .digest("hex");
  // base64url-encode "payload.signature"
  const token = Buffer.from(`${payload}.${sig}`).toString("base64url");
  return token;
}

/** Verify a signed session token; returns true if valid & not expired */
export function verifyAdminSessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return false;

    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);

    // Recompute signature
    const expected = crypto
      .createHmac(ALGORITHM, getSecret())
      .update(payload)
      .digest("hex");

    // Timing-safe comparison
    if (sig.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
      return false;

    // Check expiry
    const { ts } = JSON.parse(payload);
    if (typeof ts !== "number") return false;
    if (Date.now() - ts > MAX_AGE_MS) return false;

    return true;
  } catch {
    return false;
  }
}
