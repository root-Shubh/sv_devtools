import { runTransform, pickAction } from "../../ui/transform";
import * as c from "./conversion";

export async function run(): Promise<void> {
  await pickAction("Encoding and conversion", [
    { label: "HTML entities: encode", run: () => runTransform("HTML encode", c.htmlEncode, "html") },
    { label: "HTML entities: decode", run: () => runTransform("HTML decode", c.htmlDecode, "html") },
    { label: "Unicode: escape to \\uXXXX", run: () => runTransform("Unicode escape", c.unicodeEscape) },
    { label: "Unicode: unescape \\uXXXX", run: () => runTransform("Unicode unescape", c.unicodeUnescape) },
    { label: "Text to hex", run: () => runTransform("Text to hex", c.textToHex) },
    { label: "Hex to text", run: () => runTransform("Hex to text", c.hexToText) },
    { label: "Text to binary", run: () => runTransform("Text to binary", c.textToBinary) },
    { label: "Binary to text", run: () => runTransform("Binary to text", c.binaryToText) },
    { label: "String escape", run: () => runTransform("String escape", c.stringEscape) },
    { label: "String unescape", run: () => runTransform("String unescape", c.stringUnescape) }
  ]);
}

export const tool = { run };
