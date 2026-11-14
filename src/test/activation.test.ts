import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

// Performance guard: the activation path must not import tool modules statically.
// Tools are loaded on first use, so opening VS Code stays fast.
const ROOT = path.join(__dirname, "..", "..", "src");
const ALLOWED_STATIC = ["vscode", "./views/", "./tools/registry", "./tools/loader", "./state/", "./ui/contextActions"];

function staticImports(file: string): string[] {
  const text = fs.readFileSync(file, "utf8");
  return [...text.matchAll(/^import [^;]*? from "([^"]+)";/gm)].map((m) => m[1]);
}

test("extension entry point imports only the shell modules at activation", () => {
  const offending = staticImports(path.join(ROOT, "extension.ts")).filter(
    (spec) => !ALLOWED_STATIC.some((a) => spec === a || spec.startsWith(a))
  );
  assert.deepEqual(offending, []);
});

test("context action module loads tools lazily, not at import time", () => {
  const offending = staticImports(path.join(ROOT, "ui", "contextActions.ts")).filter((spec) => spec.startsWith("../tools/"));
  assert.deepEqual(offending, []);
});
