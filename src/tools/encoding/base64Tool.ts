import { runTransform, pickAction } from "../../ui/transform";
import { base64Encode, base64Decode } from "./base64";

export async function run(): Promise<void> {
  await pickAction("Base64", [
    { label: "Encode", run: () => runTransform("Base64 encode", base64Encode) },
    { label: "Decode", run: () => runTransform("Base64 decode", base64Decode) }
  ]);
}

export const tool = { run };
