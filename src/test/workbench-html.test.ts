import { test } from "node:test";
import * as assert from "node:assert/strict";
import { buildWorkbenchHtml, jsonForScript } from "../workbench/html";
import { TRANSFORMS } from "../workbench/transforms";

const page = (initialInput = "hello") =>
  buildWorkbenchHtml({
    nonce: "abc123",
    cspSource: "vscode-resource:",
    transforms: TRANSFORMS.map((t) => ({ id: t.id, label: t.label, group: t.group })),
    initialInput
  });

test("the page sets a strict content security policy with the nonce", () => {
  const html = page();
  const csp = /Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] ?? "";
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /script-src 'nonce-abc123'/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:/);
});

test("scripts and styles carry the nonce", () => {
  const html = page();
  assert.equal([...html.matchAll(/nonce="abc123"/g)].length, 2);
});

test("every transform appears in the tool picker, grouped", () => {
  const html = page();
  for (const t of TRANSFORMS) assert.ok(html.includes(`value="${t.id}"`), t.id);
  assert.match(html, /<optgroup label="Encode">/);
});

test("colours come from theme variables, not fixed values", () => {
  const html = page();
  const style = /<style[^>]*>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";
  assert.doesNotMatch(style, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(style, /\b(rgb|hsl)a?\(/);
  assert.match(style, /var\(--vscode-editor-background\)/);
});

test("input that looks like markup cannot close the script block", () => {
  const html = page("</script><img src=x onerror=alert(1)>");
  assert.equal([...html.matchAll(/<\/script>/g)].length, 1);
  assert.ok(!html.includes("<img src=x"));
});

test("jsonForScript escapes angle brackets and ampersands", () => {
  assert.equal(jsonForScript("<&>"), '"\\u003c\\u0026\\u003e"');
  assert.equal(JSON.parse(jsonForScript("a</b>&c")), "a</b>&c");
});
