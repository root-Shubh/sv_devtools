import { runTransform, pickAction } from "../../ui/transform";
import { hashAll, hashText, HashAlgorithm } from "./hash";

// Hash the selection (or document) with one algorithm, or all four at once.
export async function run(): Promise<void> {
  const algos: HashAlgorithm[] = ["md5", "sha1", "sha256", "sha512"];
  await pickAction("Hash", [
    {
      label: "All algorithms",
      run: () =>
        runTransform("Hashes", (t) => ({
          ok: true,
          text: Object.entries(hashAll(t))
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        }))
    },
    ...algos.map((a) => ({
      label: a.toUpperCase(),
      run: () => runTransform(a.toUpperCase(), (t) => ({ ok: true, text: hashText(t, a) }))
    }))
  ]);
}

export const tool = { run };
