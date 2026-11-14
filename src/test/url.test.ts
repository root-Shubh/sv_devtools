import { test } from "node:test";
import * as assert from "node:assert/strict";
import { urlEncode, urlDecode } from "../tools/encoding/url";

test("component encoding escapes reserved characters", () => {
  assert.deepEqual(urlEncode("a b&c=d/é"), { ok: true, text: "a%20b%26c%3Dd%2F%C3%A9" });
});

test("full-URL encoding keeps structure characters", () => {
  assert.deepEqual(urlEncode("https://x.com/a b?q=1&r=é", "full"), {
    ok: true,
    text: "https://x.com/a%20b?q=1&r=%C3%A9"
  });
});

test("decode reverses encode, including Unicode", () => {
  const original = "héllo wörld & 日本 ?";
  const encoded = urlEncode(original);
  assert.ok(encoded.ok);
  if (encoded.ok) assert.deepEqual(urlDecode(encoded.text), { ok: true, text: original });
});

test("plus is kept by default and becomes a space for form data", () => {
  assert.deepEqual(urlDecode("a+b"), { ok: true, text: "a+b" });
  assert.deepEqual(urlDecode("a+b", true), { ok: true, text: "a b" });
});

test("malformed percent sequences are reported", () => {
  assert.equal(urlDecode("100%").ok, false);
  assert.equal(urlDecode("%E9").ok, false);
});

test("empty input is valid", () => {
  assert.deepEqual(urlEncode(""), { ok: true, text: "" });
  assert.deepEqual(urlDecode(""), { ok: true, text: "" });
});
