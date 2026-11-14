import { test, beforeEach } from "node:test";
import * as assert from "node:assert/strict";
import { registerTool, loadTool, hasTool, resetLoaders } from "../tools/loader";

beforeEach(() => resetLoaders());

test("unknown tools are not registered", () => {
  assert.equal(hasTool("missing"), false);
  assert.equal(loadTool("missing"), undefined);
});

test("a tool loader runs only when the tool is first loaded", async () => {
  let calls = 0;
  registerTool("t", async () => {
    calls++;
    return { run: async () => {} };
  });
  assert.equal(calls, 0);
  await loadTool("t");
  await loadTool("t");
  assert.equal(calls, 1);
});

test("a failed load is not cached and can be retried", async () => {
  let attempts = 0;
  registerTool("flaky", async () => {
    attempts++;
    if (attempts === 1) throw new Error("boom");
    return { run: async () => {} };
  });
  await assert.rejects(loadTool("flaky")!);
  await new Promise((r) => setImmediate(r));
  await loadTool("flaky");
  assert.equal(attempts, 2);
});
