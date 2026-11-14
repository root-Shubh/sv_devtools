import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

// Theme guard: UI code must use VS Code theme colours and icons, never fixed colours,
// so the extension follows dark, light and high-contrast themes.
const root = path.join(__dirname, "..", "..", "src");

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : p.endsWith(".ts") ? [p] : [];
  });
}

test("UI code contains no fixed colour values", () => {
  const uiFiles = [
    ...files(path.join(root, "views")),
    ...files(path.join(root, "ui")),
    path.join(root, "tools", "regex", "regexTool.ts")
  ];
  const fixed = /["'`](#[0-9a-fA-F]{3,8})["'`]|\brgba?\(|\bhsla?\(|\bbackgroundColor:\s*["']/;
  const hits = uiFiles.filter((f) => fixed.test(fs.readFileSync(f, "utf8")));
  assert.deepEqual(hits, []);
});

test("decorations use theme colour tokens", () => {
  const text = fs.readFileSync(path.join(root, "tools", "regex", "regexTool.ts"), "utf8");
  assert.match(text, /new vscode\.ThemeColor\("editor\.findMatchHighlightBackground"\)/);
});
