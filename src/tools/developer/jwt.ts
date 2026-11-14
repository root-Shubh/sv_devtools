// JWT decoding. Decodes header and payload locally. It does NOT verify the signature:
// anyone can create a token with any payload, so decoded claims must not be trusted on their own.

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string; // raw base64url, not verified
  notes: string[];
}

function decodeSegment(segment: string): Record<string, unknown> {
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const json = Buffer.from(padded, "base64").toString("utf8");
  const value: unknown = JSON.parse(json);
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("JWT segment is not a JSON object.");
  }
  return value as Record<string, unknown>;
}

export function decodeJwt(token: string, now: Date = new Date()): { ok: true; value: DecodedJwt } | { ok: false; message: string } {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return { ok: false, message: "A JWT has three dot-separated parts." };
  try {
    const header = decodeSegment(parts[0]);
    const payload = decodeSegment(parts[1]);
    const notes = ["Signature NOT verified. Decoding only shows what the token claims."];
    const nowSec = Math.floor(now.getTime() / 1000);
    const exp = payload.exp;
    const nbf = payload.nbf;
    if (typeof exp === "number" && exp < nowSec) notes.push(`Expired at ${new Date(exp * 1000).toISOString()}.`);
    if (typeof nbf === "number" && nbf > nowSec) notes.push(`Not valid before ${new Date(nbf * 1000).toISOString()}.`);
    if (header.alg === "none") notes.push('Header uses alg "none": the token is unsigned.');
    return { ok: true, value: { header, payload, signature: parts[2], notes } };
  } catch (err) {
    return { ok: false, message: `Could not decode: ${err instanceof Error ? err.message : "invalid token."}` };
  }
}

// Human-readable dates for the standard time claims.
export function claimDates(payload: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of ["iat", "nbf", "exp"]) {
    const v = payload[key];
    if (typeof v === "number") out[key] = new Date(v * 1000).toISOString();
  }
  return out;
}
