import { test } from "node:test";
import * as assert from "node:assert/strict";
import { base64Encode, base64Decode } from "../tools/encoding/base64";

test("encodes ASCII text", () => {
  assert.deepEqual(base64Encode("hello"), { ok: true, text: "aGVsbG8=" });
});

test("round-trips Unicode text", () => {
  const original = "café 日本語 🙂";
  const encoded = base64Encode(original);
  assert.ok(encoded.ok);
  if (encoded.ok) assert.deepEqual(base64Decode(encoded.text), { ok: true, text: original });
});

test("decodes input with line breaks and URL-safe characters", () => {
  assert.deepEqual(base64Decode("aGVs\nbG8="), { ok: true, text: "hello" });
  assert.deepEqual(base64Decode("-_8"), base64Decode("+/8"));
});

test("rejects invalid Base64", () => {
  assert.equal(base64Decode("abc$").ok, false);
  assert.equal(base64Decode("a").ok, false);
});

test("rejects empty input", () => {
  assert.equal(base64Decode("   ").ok, false);
  assert.deepEqual(base64Encode(""), { ok: true, text: "" });
});

test("rejects bytes that are not UTF-8", () => {
  // 0xFF is never valid UTF-8
  assert.equal(base64Decode("/w==").ok, false);
});
