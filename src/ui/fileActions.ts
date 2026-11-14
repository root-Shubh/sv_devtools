import * as vscode from "vscode";
import * as fs from "fs/promises";
// Explorer right-click actions for files. Files are read from disk (never written).
// Output opens in a new document; nothing on disk changes.
// Tool modules are imported inside each action so activation loads no tool code.

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function readFileText(uri: vscode.Uri): Promise<string | undefined> {
  const stat = await fs.stat(uri.fsPath);
  if (stat.size > MAX_FILE_BYTES) {
    void vscode.window.showErrorMessage(`File is larger than 5 MB (${Math.round(stat.size / 1024 / 1024)} MB). Dev Tool does not process it.`);
    return undefined;
  }
  const text = await fs.readFile(uri.fsPath, "utf8");
  // A NUL byte is a reliable sign of binary data; text tools cannot make sense of it.
  if (text.includes("\u0000")) {
    void vscode.window.showErrorMessage("This looks like a binary file. Dev Tool works on text files.");
    return undefined;
  }
  return text;
}

async function show(title: string, text: string, language = "plaintext"): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({ content: text, language });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  void vscode.window.showInformationMessage(`${title}: done.`);
}

// Each action takes the resource that was right-clicked (or the active file as a fallback).
function targetOf(uri?: vscode.Uri): vscode.Uri | undefined {
  return uri ?? vscode.window.activeTextEditor?.document.uri;
}

export const fileActions = {
  sha256: async (uri?: vscode.Uri) => {
    const target = targetOf(uri);
    if (!target) return;
    const text = await readFileText(target);
    if (text === undefined) return;
    const { hashText } = await import("../tools/generators/hash");
    await show("SHA-256", `${hashText(text, "sha256")}  ${target.fsPath}`);
  },
  base64: async (uri?: vscode.Uri) => {
    const target = targetOf(uri);
    if (!target) return;
    const text = await readFileText(target);
    if (text === undefined) return;
    const { base64Encode } = await import("../tools/encoding/base64");
    const r = base64Encode(text);
    if (r.ok) await show("Base64", r.text);
  },
  jsonValidate: async (uri?: vscode.Uri) => {
    const target = targetOf(uri);
    if (!target) return;
    const text = await readFileText(target);
    if (text === undefined) return;
    const { validateJson } = await import("../tools/json/format");
    const r = validateJson(text);
    void (r.ok ? vscode.window.showInformationMessage("Valid JSON.") : vscode.window.showErrorMessage(r.message));
  },
  jsonFormat: async (uri?: vscode.Uri) => {
    const target = targetOf(uri);
    if (!target) return;
    const text = await readFileText(target);
    if (text === undefined) return;
    const { formatJson } = await import("../tools/json/format");
    const r = formatJson(text);
    if (r.ok) await show("Format JSON", r.text, "json");
    else void vscode.window.showErrorMessage(r.message);
  },
  stats: async (uri?: vscode.Uri) => {
    const target = targetOf(uri);
    if (!target) return;
    const text = await readFileText(target);
    if (text === undefined) return;
    const { countStats } = await import("../tools/text/textUtils");
    const s = countStats(text);
    await show("File statistics", `File: ${target.fsPath}\nCharacters: ${s.characters}\nWords: ${s.words}\nLines: ${s.lines}`);
  }
};

export function registerFileActions(context: vscode.ExtensionContext): void {
  for (const [name, action] of Object.entries(fileActions)) {
    context.subscriptions.push(vscode.commands.registerCommand(`devtool.file.${name}`, action));
  }
}
