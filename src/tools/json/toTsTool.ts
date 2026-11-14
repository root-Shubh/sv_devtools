import { runTransform } from "../../ui/transform";
import { jsonToTypeScript } from "./toTs";

export async function run(): Promise<void> {
  await runTransform("JSON to TypeScript", (x) => jsonToTypeScript(x, "Root"), "typescript");
}

export const tool = { run };
