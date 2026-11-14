// Image bytes to a data URI (data:<mime>;base64,...). Pure logic.

export const IMAGE_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon"
};

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function mimeForExtension(ext: string): string | undefined {
  return IMAGE_MIME[ext.toLowerCase()];
}

export function toDataUri(
  bytes: Uint8Array,
  mime: string
): { ok: true; text: string } | { ok: false; message: string } {
  if (bytes.length > MAX_IMAGE_BYTES) {
    return { ok: false, message: `Image is ${Math.round(bytes.length / 1024)} KB; the limit is 2 MB.` };
  }
  return { ok: true, text: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}` };
}

// Human-readable size, for the summary line.
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
