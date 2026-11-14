// Hash digests over UTF-8 text, computed locally. Pure logic.
import { createHash } from "crypto";

export const HASH_ALGORITHMS = ["md5", "sha1", "sha256", "sha512"] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export function hashText(text: string, algorithm: HashAlgorithm): string {
  return createHash(algorithm).update(text, "utf8").digest("hex");
}

export function hashAll(text: string): Record<HashAlgorithm, string> {
  return {
    md5: hashText(text, "md5"),
    sha1: hashText(text, "sha1"),
    sha256: hashText(text, "sha256"),
    sha512: hashText(text, "sha512")
  };
}
