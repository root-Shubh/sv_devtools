import * as vscode from "vscode";
import { runTransform } from "./transform";

// Editor right-click actions for a selection, grouped under the Dev Tool submenu.
// Transforms reuse the shared helper: output opens in a new document, and the source
// is replaced only when the user clicks Replace.
//
// Tool modules are imported inside each action, not at the top of this file, so activation
// does not load any tool code.

// Wraps a plain string function as a transform that always succeeds.
const text = (fn: (x: string) => string) => (x: string) => ({ ok: true as const, text: fn(x) });

export const contextActions = {
  // Encode and decode
  base64Encode: async () => {
    const m = await import("../tools/encoding/base64");
    await runTransform("Base64 encode", m.base64Encode);
  },
  base64Decode: async () => {
    const m = await import("../tools/encoding/base64");
    await runTransform("Base64 decode", m.base64Decode);
  },
  urlEncodeComponent: async () => {
    const m = await import("../tools/encoding/url");
    await runTransform("URL encode", (x) => m.urlEncode(x, "component"));
  },
  urlDecode: async () => {
    const m = await import("../tools/encoding/url");
    await runTransform("URL decode", (x) => m.urlDecode(x));
  },
  htmlEncode: async () => {
    const m = await import("../tools/encoding/conversion");
    await runTransform("HTML encode", m.htmlEncode, "html");
  },
  htmlDecode: async () => {
    const m = await import("../tools/encoding/conversion");
    await runTransform("HTML decode", m.htmlDecode, "html");
  },
  textToHex: async () => {
    const m = await import("../tools/encoding/conversion");
    await runTransform("Text to hex", m.textToHex);
  },
  hexToText: async () => {
    const m = await import("../tools/encoding/conversion");
    await runTransform("Hex to text", m.hexToText);
  },

  // Format
  formatJson: async () => {
    const m = await import("../tools/json/format");
    await runTransform("Format JSON", (x) => m.formatJson(x), "json");
  },
  minifyJson: async () => {
    const m = await import("../tools/json/format");
    await runTransform("Minify JSON", (x) => m.minifyJson(x), "json");
  },
  formatSql: async () => {
    const m = await import("../tools/developer/utilities");
    await runTransform("Format SQL", text(m.formatSql), "sql");
  },
  formatXml: async () => {
    const m = await import("../tools/developer/references");
    await runTransform("Format XML", (x) => m.formatXml(x), "xml");
  },

  // Text
  sortLines: async () => {
    const m = await import("../tools/text/textUtils");
    await runTransform("Sort lines", text((x) => m.sortLines(x)));
  },
  dedupeLines: async () => {
    const m = await import("../tools/text/textUtils");
    await runTransform("Remove duplicate lines", text(m.removeDuplicateLines));
  },
  trimLines: async () => {
    const m = await import("../tools/text/textUtils");
    await runTransform("Trim lines", text(m.trimLines));
  },
  removeEmptyLines: async () => {
    const m = await import("../tools/text/textUtils");
    await runTransform("Remove empty lines", text(m.removeEmptyLines));
  },
  uppercase: async () => runTransform("Uppercase", (x) => ({ ok: true, text: x.toUpperCase() })),
  lowercase: async () => runTransform("Lowercase", (x) => ({ ok: true, text: x.toLowerCase() })),
  countStats: async () => {
    const editor = vscode.window.activeTextEditor;
    const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
    const m = await import("../tools/text/textUtils");
    const s = m.countStats(selected);
    void vscode.window.showInformationMessage(`Selection: ${s.characters} characters, ${s.words} words, ${s.lines} lines.`);
  },

  // Hashes
  sha256: async () => {
    const m = await import("../tools/generators/hash");
    await runTransform("SHA-256", (x) => ({ ok: true, text: m.hashText(x, "sha256") }));
  },
  md5: async () => {
    const m = await import("../tools/generators/hash");
    await runTransform("MD5", (x) => ({ ok: true, text: m.hashText(x, "md5") }));
  },

  // Escapes
  jsonEscape: async () => {
    const m = await import("../tools/json/utilities");
    await runTransform("Escape as JSON string", (x) => ({ ok: true, text: m.escapeJsonString(x) }));
  },
  jsonUnescape: async () => {
    const m = await import("../tools/json/utilities");
    await runTransform("Unescape JSON string", (x) => m.unescapeJsonString(x));
  },

  // String literals for code
  literalJava: async () => {
    const m = await import("../tools/text/codeLiteral");
    await runTransform("Java string literal", text((x) => m.toStringLiteral(x, "java")));
  },
  literalCSharp: async () => {
    const m = await import("../tools/text/codeLiteral");
    await runTransform("C# string literal", text((x) => m.toStringLiteral(x, "csharp")));
  },
  literalPython: async () => {
    const m = await import("../tools/text/codeLiteral");
    await runTransform("Python string literal", text((x) => m.toStringLiteral(x, "python")));
  },

  // Compare and regex
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
