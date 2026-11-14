// HMAC signature check for JWTs (HS256, HS384, HS512). Pure logic.
// The secret is passed in for this one call. Nothing here stores it.
import { createHmac, timingSafeEqual } from "crypto";

export type VerifyResult =
  | { ok: true; valid: boolean; alg: string; message: string }
  | { ok: false; message: string };

const HMAC: Record<string, string> = { HS256: "sha256", HS384: "sha384", HS512: "sha512" };

function b64urlToBuffer(s: string): Buffer {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64 + "=".repeat((4 - (b64.length % 4)) % 4), "base64");
}

export function verifyJwtHmac(token: string, secret: string): VerifyResult {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return { ok: false, message: "A JWT has three dot-separated parts." };
  if (secret === "") return { ok: false, message: "Enter the secret to verify the signature." };

  let alg: unknown;
  try {
    alg = JSON.parse(b64urlToBuffer(parts[0]).toString("utf8")).alg;
  } catch {
    return { ok: false, message: "The header is not valid JSON." };
  }
  if (typeof alg !== "string") return { ok: false, message: "The header has no alg field." };
  const digest = HMAC[alg];
  if (!digest) {
    return {
      ok: false,
      message: alg === "none"
        ? 'This token is unsigned (alg "none"), so there is nothing to verify.'
        : `Only HMAC algorithms (HS256, HS384, HS512) can be checked with a secret. This token uses ${alg}.`
    };
  }

  const expected = createHmac(digest, secret).update(`${parts[0]}.${parts[1]}`, "utf8").digest();
  const actual = b64urlToBuffer(parts[2]);
  // Constant-time comparison; different lengths are simply not equal.
  const valid = expected.length === actual.length && timingSafeEqual(expected, actual);
  return {
    ok: true,
    valid,
    alg,
    message: valid ? `Signature is valid (${alg}).` : `Signature does NOT match this secret (${alg}).`
  };
}
