// JSON comparison. Pure logic, no VS Code dependency.
// By default object key order is ignored. Set orderSensitive to compare key order too.

export type JsonChangeKind = "added" | "removed" | "changed";

export interface JsonChange {
  kind: JsonChangeKind;
  path: string; // e.g. $.user.roles[1]
  from?: unknown;
  to?: unknown;
}

export interface CompareOptions {
  orderSensitive?: boolean;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function childPath(base: string, key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`;
}

export function compareJson(a: unknown, b: unknown, options: CompareOptions = {}, path = "$"): JsonChange[] {
  const changes: JsonChange[] = [];

  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) changes.push({ kind: "added", path: p, to: b[i] });
      else if (i >= b.length) changes.push({ kind: "removed", path: p, from: a[i] });
      else changes.push(...compareJson(a[i], b[i], options, p));
    }
    return changes;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (options.orderSensitive && aKeys.join("\u0000") !== bKeys.join("\u0000")) {
      changes.push({ kind: "changed", path: `${path} (key order)`, from: aKeys, to: bKeys });
    }
    const keys = new Set([...aKeys, ...bKeys]);
    for (const key of keys) {
      const p = childPath(path, key);
      const inA = Object.prototype.hasOwnProperty.call(a, key);
      const inB = Object.prototype.hasOwnProperty.call(b, key);
      if (!inA) changes.push({ kind: "added", path: p, to: b[key] });
      else if (!inB) changes.push({ kind: "removed", path: p, from: a[key] });
      else changes.push(...compareJson(a[key], b[key], options, p));
    }
    return changes;
  }

  if (!Object.is(a, b)) {
    changes.push({ kind: "changed", path, from: a, to: b });
  }
  return changes;
}

export function compareJsonText(a: string, b: string, options: CompareOptions = {}): { changes?: JsonChange[]; error?: string } {
  let left: unknown;
  let right: unknown;
  try {
    left = JSON.parse(a);
  } catch (err) {
    return { error: `Left side is not valid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  try {
    right = JSON.parse(b);
  } catch (err) {
    return { error: `Right side is not valid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  return { changes: compareJson(left, right, options) };
}
