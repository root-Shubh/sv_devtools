import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { TOOLS } from "../tools/registry";

// Wiring guards: every listed tool must be registered, every contributed command must have a title,
// and every keybinding must point at a real command.
const root = path.join(__dirname, "..", "..");
const extensionSource = fs.readFileSync(path.join(root, "src", "extension.ts"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("every tool in the registry has a loader registered", () => {
  const registered = new Set([...extensionSource.matchAll(/registerTool\("([^"]+)"/g)].map((m) => m[1]));
  const missing = TOOLS.map((t) => t.id).filter((id) => !registered.has(id));
  assert.deepEqual(missing, []);
});

test("every contributed command has a non-empty title", () => {
  for (const c of manifest.contributes.commands as { command: string; title?: string }[]) {
    assert.ok(c.title && c.title.trim().length > 0, `missing title for ${c.command}`);
  }
});

test("every command is registered in code or is a known shell command", () => {
  const registered = new Set([...extensionSource.matchAll(/registerCommand\("([^"]+)"/g)].map((m) => m[1]));
  const contextCommands = ["devtool.ctx."];
  for (const c of manifest.contributes.commands as { command: string }[]) {
    const ok = registered.has(c.command) || contextCommands.some((p) => c.command.startsWith(p)) || c.command === "devtool.openTool";
    assert.ok(ok, `no handler for ${c.command}`);
  }
});

test("keybindings target only contributed commands", () => {
  const commands = new Set((manifest.contributes.commands as { command: string }[]).map((c) => c.command));
  for (const k of manifest.contributes.keybindings as { command: string }[]) {
    assert.ok(commands.has(k.command), `unknown command in keybinding: ${k.command}`);
  }
});
