import * as vscode from "vscode";
import { runTransform } from "./transform";

// Editor right-click actions for a selection. Each one reuses the same transform helper,
// so output opens in a new document and the source is replaced only when the user clicks Replace.
//
// Tool modules are imported inside each action, not at the top of this file, so activation
// does not load any tool code.
export const contextActions = {
  base64Encode: async () => {
    const m = await import("../tools/encoding/base64");
    await runTransform("Base64 encode", m.base64Encode);
  },
  base64Decode: async () => {
    const m = await import("../tools/encoding/base64");
    await runTransform("Base64 decode", m.base64Decode);
  },
  formatJson: async () => {
    const m = await import("../tools/json/format");
    await runTransform("Format JSON", (x) => m.formatJson(x), "json");
  },
  dedupeLines: async () => {
    const m = await import("../tools/text/textUtils");
    await runTransform("Remove duplicate lines", (x) => ({ ok: true, text: m.removeDuplicateLines(x) }));
  },
  sha256: async () => {
    const m = await import("../tools/generators/hash");
    await runTransform("SHA-256", (x) => ({ ok: true, text: m.hashText(x, "sha256") }));
  },
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
