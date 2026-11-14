// ULID: 26 characters, Crockford base32. 48-bit millisecond timestamp, then 80 random bits.
// Sorts by creation time as text. Pure apart from the injected random source.
import { randomBytes } from "crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function encodeUlid(timeMs: number, random: Uint8Array): string {
  if (!Number.isInteger(timeMs) || timeMs < 0 || timeMs > 0xffffffffffff) {
    throw new RangeError("Timestamp must be a whole number of milliseconds from 0 to 2^48-1.");
  }
  if (random.length !== 10) throw new RangeError("Randomness must be 10 bytes.");

  let out = "";
  // Timestamp: 10 characters, 5 bits each, most significant first.
  let t = timeMs;
  const timeChars: string[] = [];
  for (let i = 0; i < 10; i++) {
    timeChars.unshift(ALPHABET[t % 32]);
    t = Math.floor(t / 32);
  }
  out += timeChars.join("");

  // Randomness: 80 bits as 16 characters of 5 bits each.
  let bits = 0;
  let bitCount = 0;
  for (const byte of random) {
    bits = (bits << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      out += ALPHABET[(bits >> bitCount) & 31];
    }
    bits &= (1 << bitCount) - 1;
  }
  return out;
}

export function generateUlids(count: number, now = Date.now(), source: (n: number) => Uint8Array = (n) => randomBytes(n)): string[] {
  const n = Math.min(100, Math.max(1, Math.floor(count)));
  return Array.from({ length: n }, () => encodeUlid(now, source(10)));
}

export function decodeUlidTime(ulid: string): number | undefined {
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid)) return undefined;
  let t = 0;
  for (const ch of ulid.slice(0, 10).toUpperCase()) t = t * 32 + ALPHABET.indexOf(ch);
  return t;
}
