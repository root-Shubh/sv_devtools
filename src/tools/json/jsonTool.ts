import * as vscode from "vscode";
import { formatJson, minifyJson, validateJson, JsonResult } from "./format";

// JSON Formatter UI. Works on the selection, or the whole document if nothing is selected.
// Output opens in a new document. Source text is only replaced after an explicit click.

function source(): { text: string; editor?: vscode.TextEditor; range?: vscode.Range } {
  const editor = vscode.window.activeTextEditor;
  if (editor && !editor.selection.isEmpty) {
    return { text: editor.document.getText(editor.selection), editor, range: editor.selection };
  }
  if (editor) {
    return { text: editor.document.getText(), editor, range: new vscode.Range(0, 0, editor.document.lineCount, 0) };
  }
  return { text: "" };
}

async function show(result: JsonResult, label: string): Promise<void> {
  if (!result.ok) {
    void vscode.window.showErrorMessage(result.message);
    return;
  }
  const { editor, range } = source();
  const doc = await vscode.workspace.openTextDocument({ content: result.text, language: "json" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  const replaceLabel = "Replace source";
  const choice = await vscode.window.showInformationMessage(`${label}: done.`, replaceLabel);
  if (choice === replaceLabel && editor && range) {
    await editor.edit((b) => b.replace(range, result.text));
  }
}

export async function run(): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    [
      { label: "Format", id: "format" },
      { label: "Minify", id: "minify" },
      { label: "Validate", id: "validate" }
    ],
    { placeHolder: "JSON action" }
  );
  if (!pick) return;
  const { text } = source();
  if (pick.id === "validate") {
    const r = validateJson(text);
    void vscode.window.showInformationMessage(r.ok ? "Valid JSON." : r.message);
    return;
  }
  const result = pick.id === "format" ? formatJson(text) : minifyJson(text);
  await show(result, pick.label);
}

export const tool = { run };
