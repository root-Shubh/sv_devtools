import { runTransform, pickAction } from "../../ui/transform";
import { urlEncode, urlDecode } from "./url";

export async function run(): Promise<void> {
  await pickAction("URL encode/decode", [
    { label: "Encode (query value)", run: () => runTransform("URL encode", (t) => urlEncode(t, "component")) },
    { label: "Encode (whole URL)", run: () => runTransform("URL encode", (t) => urlEncode(t, "full")) },
    { label: "Decode", run: () => runTransform("URL decode", (t) => urlDecode(t)) },
    { label: "Decode (form data, + as space)", run: () => runTransform("URL decode", (t) => urlDecode(t, true)) }
  ]);
}

export const tool = { run };
