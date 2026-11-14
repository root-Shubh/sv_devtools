// Generates TypeScript interfaces from JSON samples. Pure logic, no VS Code dependency.
//
// Rules:
// - Objects become interfaces; nested objects get their own named interface.
// - null becomes a nullable type (T | null).
// - Arrays of objects are merged: a key missing from some items becomes optional (?).
// - Arrays of mixed primitives become unions.

type Json = unknown;

const pascal = (s: string): string => {
  const parts = s.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  return /^[A-Za-z_$]/.test(name) ? name : `T${name}`;
};

const keyText = (k: string): string => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));

const isObject = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

function unionOf(types: string[]): string {
  const unique = [...new Set(types)];
  return unique.length === 0 ? "unknown" : unique.join(" | ");
}

class Gen {
  private readonly interfaces: string[] = [];
  private readonly used = new Map<string, number>();

  // Gives each generated interface a unique name.
  private uniqueName(base: string): string {
    const n = this.used.get(base) ?? 0;
    this.used.set(base, n + 1);
    return n === 0 ? base : `${base}${n + 1}`;
  }

  typeOf(value: Json, hint: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const singular = /s$/i.test(hint) && hint.length > 1 ? hint.slice(0, -1) : hint + "Item";
      const element = this.typeOfMany(value, singular);
      return element.includes("|") ? `(${element})[]` : `${element}[]`;
    }
    if (isObject(value)) return this.objectType(value, hint);
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "unknown";
  }

  // Types for a list of values; objects are merged into one interface.
  private typeOfMany(values: Json[], hint: string): string {
    const objects = values.filter(isObject);
    const others = values.filter((v) => !isObject(v));
    const parts: string[] = [];
    if (objects.length > 0) parts.push(this.mergedObjectType(objects, hint));
    for (const v of others) parts.push(this.typeOf(v, hint));
    return unionOf(parts);
  }

  private objectType(obj: Record<string, Json>, hint: string): string {
    return this.mergedObjectType([obj], hint);
  }

  private mergedObjectType(objects: Record<string, Json>[], hint: string): string {
    const name = this.uniqueName(pascal(hint));
    const keys: string[] = [];
    for (const o of objects) for (const k of Object.keys(o)) if (!keys.includes(k)) keys.push(k);
    const lines: string[] = [];
    for (const k of keys) {
      const present = objects.filter((o) => Object.prototype.hasOwnProperty.call(o, k));
      const optional = present.length < objects.length ? "?" : "";
      const values = present.map((o) => o[k]);
      const type = this.typeOfMany(values, pascal(k) || "Field");
      lines.push(`  ${keyText(k)}${optional}: ${type};`);
    }
    this.interfaces.push(`export interface ${name} {\n${lines.join("\n")}\n}`);
    return name;
  }

  output(): string {
    return this.interfaces.slice().reverse().join("\n\n");
  }
}

export function jsonToTypeScript(
  json: string,
  rootName = "Root"
): { ok: true; text: string } | { ok: false; message: string } {
  if (json.trim() === "") {
    return { ok: false, message: "Nothing to convert. Select JSON, or open a document that contains JSON." };
  }
  let value: Json;
  try {
    value = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  const gen = new Gen();
  const type = gen.typeOf(value, pascal(rootName) || "Root");
  if (!isObject(value)) {
    return { ok: true, text: `export type ${pascal(rootName) || "Root"} = ${type};` };
  }
  return { ok: true, text: gen.output() };
}
