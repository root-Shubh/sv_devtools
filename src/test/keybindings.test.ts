import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

// Reads the manifest from the project root (two levels above out/test).
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));

test("every keybinding points to a declared command", () => {
  const commands = new Set((manifest.contributes.commands as { command: string }[]).map((c) => c.command));
  for (const binding of manifest.contributes.keybindings as { command: string }[]) {
    assert.ok(commands.has(binding.command), `unknown command ${binding.command}`);
  }
});

test("keybindings do not reuse the same key for different commands", () => {
  const seen = new Map<string, string>();
  for (const binding of manifest.contributes.keybindings as { key: string; command: string; when?: string }[]) {
    const id = `${binding.key}|${binding.when ?? ""}`;
    assert.ok(!seen.has(id) || seen.get(id) === binding.command, `duplicate key ${binding.key}`);
    seen.set(id, binding.command);
  }
});
