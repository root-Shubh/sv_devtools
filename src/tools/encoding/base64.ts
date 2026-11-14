// Base64 encode/decode with UTF-8 text. Pure logic, no VS Code dependency.

export type CodecResult = { ok: true; text: string } | { ok: false; message: string };

const STRICT = /^[A-Za-z0-9+/]*={0,2}$/;

export function base64Encode(text: string): CodecResult {
  return { ok: true, text: Buffer.from(text, "utf8").toString("base64") };
}

export function base64Decode(text: string): CodecResult {
  // Accept URL-safe alphabet and whitespace/newlines from copy-paste.
  const normalized = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  // Empty text is valid: it is what an empty string encodes to, so round trips work.
  if (normalized.length === 0) return { ok: true, text: "" };
  if (!STRICT.test(normalized) || normalized.length % 4 === 1) {
    return { ok: false, message: "Input is not valid Base64." };
  }
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const decoded = Buffer.from(padded, "base64");
  // Reject bytes that are not valid UTF-8 rather than producing replacement characters silently.
  const roundTrip = decoded.toString("utf8");
  if (roundTrip.includes("�") && !Buffer.from(roundTrip, "utf8").equals(decoded)) {
    return { ok: false, message: "Decoded bytes are not valid UTF-8 text." };
  }
  return { ok: true, text: roundTrip };
}
