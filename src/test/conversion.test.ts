import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as c from "../tools/encoding/conversion";

const ok = (r: c.Conv) => {
  assert.ok(r.ok, r.ok ? "" : r.message);
  return r.ok ? r.text : "";
};

test("HTML encode escapes the five special characters", () => {
  assert.equal(ok(c.htmlEncode(`<a href="x">&'</a>`)), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
});

test("HTML decode handles named and numeric entities and round-trips", () => {
  assert.equal(ok(c.htmlDecode("&lt;b&gt; &amp; &#65; &#x1F642; &nbsp;")), "<b> & A 🙂  ");
  const s = `a < b & "c" 'd' 日本`;
  assert.equal(ok(c.htmlDecode(ok(c.htmlEncode(s)))), s);
});

test("HTML decode leaves unknown or out-of-range entities alone", () => {
  assert.equal(ok(c.htmlDecode("&unknown; &#x110000;")), "&unknown; &#x110000;");
});

test("Unicode escape and unescape round-trip, including astral characters", () => {
  assert.equal(ok(c.unicodeEscape("é")), "\\u00e9");
  assert.equal(ok(c.unicodeUnescape("\\u00e9 \\u{1F642}")), "é 🙂");
  const s = "日本 🙂";
  assert.equal(ok(c.unicodeUnescape(ok(c.unicodeEscape(s)))), s);
});

test("text to hex and back, with Unicode", () => {
  assert.equal(ok(c.textToHex("Hi")), "48 69");
  assert.equal(ok(c.hexToText("0x48 69")), "Hi");
  assert.equal(ok(c.hexToText(ok(c.textToHex("é日")))), "é日");
});

test("hex input is validated", () => {
  assert.equal(c.hexToText("abc").ok, false);
  assert.equal(c.hexToText("zz").ok, false);
  assert.equal(c.hexToText("").ok, false);
  assert.equal(c.hexToText("ff").ok, false, "0xFF is not valid UTF-8");
});

test("text to binary and back", () => {
  assert.equal(ok(c.textToBinary("A")), "01000001");
  assert.equal(ok(c.binaryToText("01000001 01000010")), "AB");
  assert.equal(c.binaryToText("0100").ok, false);
  assert.equal(c.binaryToText("0102").ok, false);
});

test("string escape and unescape round-trip control characters", () => {
  const s = 'line1\nline2\t"q" \\ \u0001';
  assert.equal(ok(c.stringUnescape(ok(c.stringEscape(s)))), s);
  assert.equal(ok(c.stringUnescape("\\x41")), "A");
  assert.equal(c.stringUnescape("bad\\").ok, false);
});
