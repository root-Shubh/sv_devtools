// UUID v4 generation. Pure logic apart from the injected random source.
import { randomUUID } from "crypto";

export interface UuidOptions {
  count: number; // 1..100
  uppercase?: boolean;
  noDashes?: boolean;
}

export const MAX_UUID_COUNT = 100;

export function generateUuids(options: UuidOptions, source: () => string = randomUUID): string[] {
  const count = Math.min(MAX_UUID_COUNT, Math.max(1, Math.floor(options.count)));
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let id = source().toLowerCase();
    if (options.noDashes) id = id.replace(/-/g, "");
    if (options.uppercase) id = id.toUpperCase();
    out.push(id);
  }
  return out;
}
