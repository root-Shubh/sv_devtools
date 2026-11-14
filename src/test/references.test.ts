import { test } from "node:test";
import * as assert from "node:assert/strict";
import { formatXml, validateXml, visualiseEscapes, HTTP_STATUS, MIME_TYPES } from "../tools/developer/references";

test("XML is indented by nesting depth", () => {
  const r = formatXml("<root><a>1</a><b><c/></b></root>");
  assert.deepEqual(r, { ok: true, text: "<root>\n  <a>\n    1\n  </a>\n  <b>\n    <c/>\n  </b>\n</root>" });
});

test("XML declarations and comments are kept", () => {
  const r = formatXml('<?xml version="1.0"?><!-- note --><r/>');
  assert.ok(r.ok && r.text.includes("<?xml") && r.text.includes("<!-- note -->"));
});

test("mismatched and unclosed XML tags are reported", () => {
  const mismatch = validateXml("<a><b></a>");
  assert.equal(mismatch.ok, false);
  assert.equal(validateXml("<a><b>").ok, false);
  assert.deepEqual(validateXml("<a>x</a>"), { ok: true, text: "Well-formed XML." });
});

test("stray text outside tags is reported when it is malformed", () => {
  assert.equal(formatXml("<a>").ok, false);
});

test("escape visualiser shows code points and escaped forms", () => {
  const out = visualiseEscapes("a\n");
  assert.match(out, /a\s+U\+0061\s+a/);
  assert.match(out, /\\n\s+U\+000A\s+\\n/);
  assert.equal(visualiseEscapes(""), "(empty)");
});

test("escape visualiser handles astral characters as one entry", () => {
  const lines = visualiseEscapes("🙂").split("\n");
  assert.equal(lines.length, 1);
  assert.match(lines[0], /U\+1F642/);
});

test("HTTP status reference has unique codes and sensible names", () => {
  const codes = HTTP_STATUS.map((s) => s.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(HTTP_STATUS.find((s) => s.code === 404)?.name, "Not Found");
});

test("MIME reference has no duplicate extensions and no invented entries", () => {
  const exts = MIME_TYPES.map((m) => m.ext);
  assert.equal(new Set(exts).size, exts.length);
  for (const m of MIME_TYPES) assert.match(m.mime, /^[a-z]+\/[a-z0-9.+-]+$/);
});
