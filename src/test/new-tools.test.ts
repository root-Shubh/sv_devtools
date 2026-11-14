import { test } from "node:test";
import * as assert from "node:assert/strict";
import { encodeUlid, generateUlids, decodeUlidTime } from "../tools/generators/ulid";
import { toStringLiteral } from "../tools/text/codeLiteral";
import { toDataUri, mimeForExtension, MAX_IMAGE_BYTES, formatBytes } from "../tools/encoding/dataUri";

// ULID
test("ULID is 26 Crockford base32 characters", () => {
  const [u] = generateUlids(1, 1700000000000);
  assert.match(u, /^[0-9A-HJKMNP-TV-Z]{26}$/);
});

test("ULID encodes the timestamp in the first 10 characters and decodes back", () => {
  const ms = 1700000000123;
  const u = encodeUlid(ms, new Uint8Array(10));
  assert.equal(decodeUlidTime(u), ms);
});

test("ULIDs created later sort later as text", () => {
  const a = encodeUlid(1000, new Uint8Array(10).fill(255));
  const b = encodeUlid(1001, new Uint8Array(10));
  assert.ok(a < b);
});

test("ULID with all-zero randomness is all zeros in the tail", () => {
  assert.equal(encodeUlid(0, new Uint8Array(10)), "0".repeat(26));
});

test("ULID rejects bad timestamps and bad randomness length", () => {
  assert.throws(() => encodeUlid(-1, new Uint8Array(10)), RangeError);
  assert.throws(() => encodeUlid(1.5, new Uint8Array(10)), RangeError);
  assert.throws(() => encodeUlid(1, new Uint8Array(9)), RangeError);
});

test("generated ULIDs are unique and count is clamped", () => {
  const ids = generateUlids(50);
  assert.equal(new Set(ids).size, 50);
  assert.equal(generateUlids(1000).length, 100);
  assert.equal(decodeUlidTime("short"), undefined);
});

// String literals
test("Java and C# literals escape quotes, backslashes and newlines", () => {
  assert.equal(toStringLiteral('say "hi"\\n\nnext', "java"), '"say \\"hi\\"\\\\n\\nnext"');
  assert.equal(toStringLiteral("a\tb", "csharp"), '"a\\tb"');
});

test("control characters and non-ASCII become \\u escapes in Java and C#", () => {
  assert.equal(toStringLiteral("\u0001é", "java"), '"\\u0001\\u00e9"');
  assert.equal(toStringLiteral("🙂", "csharp"), '"\\ud83d\\ude42"');
});

test("Python keeps non-ASCII text and uses \\U for astral characters", () => {
  assert.equal(toStringLiteral("é", "python"), '"é"');
  assert.equal(toStringLiteral("🙂", "python"), '"\\U0001f642"');
});

test("empty text gives an empty literal", () => {
  assert.equal(toStringLiteral("", "java"), '""');
});

// Data URIs
test("image bytes become a data URI with the right MIME type", () => {
  const r = toDataUri(Buffer.from("hi"), "image/png");
  assert.deepEqual(r, { ok: true, text: "data:image/png;base64,aGk=" });
});

test("oversized images are refused", () => {
  const r = toDataUri(new Uint8Array(MAX_IMAGE_BYTES + 1), "image/png");
  assert.equal(r.ok, false);
});

test("MIME lookup is case-insensitive and rejects non-images", () => {
  assert.equal(mimeForExtension(".PNG"), "image/png");
  assert.equal(mimeForExtension(".exe"), undefined);
});

test("byte sizes are formatted", () => {
  assert.equal(formatBytes(10), "10 B");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(3 * 1024 * 1024), "3.00 MB");
});
