import * as vscode from "vscode";
import { runTransform } from "./transform";
import { base64Encode, base64Decode } from "../tools/encoding/base64";
import { formatJson } from "../tools/json/format";
import { removeDuplicateLines } from "../tools/text/textUtils";
import { hashText } from "../tools/generators/hash";

// Editor right-click actions for a selection. Each one reuses the same transform helper,
// so output opens in a new document and the source is replaced only when the user clicks Replace.
export const contextActions = {
  base64Encode: () => runTransform("Base64 encode", base64Encode),
  base64Decode: () => runTransform("Base64 decode", base64Decode),
  formatJson: () => runTransform("Format JSON", (x) => formatJson(x), "json"),
  dedupeLines: () => runTransform("Remove duplicate lines", (x) => ({ ok: true, text: removeDuplicateLines(x) })),
  sha256: () => runTransform("SHA-256", (x) => ({ ok: true, text: hashText(x, "sha256") })),
  compareWithClipboard: async () => {
    const quick = await import("../tools/text/quickDiff");
    await quick.selectionVsClipboard();
  },
  openRegex: async () => {
    const regex = await import("../tools/regex/regexTool");
    await regex.run();
  }
};

export function registerContextActions(context: vscode.ExtensionContext): void {
  for (const [name, action] of Object.entries(contextActions)) {
    context.subscriptions.push(vscode.commands.registerCommand(`devtool.ctx.${name}`, action));
  }
}
