import * as vscode from "vscode";
import { compareJsonText } from "./compare";

// Compares the selections (or the two halves of the document, if there are two selections).
// Result opens as a plain list of changes in a new document.

export async function run(): Promise<void> {
  const left = await vscode.window.showInputBox({ prompt: "Left JSON (paste or leave blank to use selection)" });
  if (left === undefined) return;
  const right = await vscode.window.showInputBox({ prompt: "Right JSON" });
  if (right === undefined) return;
  const orderPick = await vscode.window.showQuickPick(["Ignore key order (default)", "Key order matters"], {
    placeHolder: "Comparison mode"
  });
  if (!orderPick) return;

  const result = compareJsonText(left, right, { orderSensitive: orderPick.startsWith("Key order matters") });
  if (result.error) {
    void vscode.window.showErrorMessage(result.error);
    return;
  }
  const changes = result.changes ?? [];
  if (changes.length === 0) {
    void vscode.window.showInformationMessage("The JSON documents are equal.");
    return;
  }
  const lines = changes.map((c) => {
    if (c.kind === "added") return `+ ${c.path}: ${JSON.stringify(c.to)}`;
    if (c.kind === "removed") return `- ${c.path}: ${JSON.stringify(c.from)}`;
    return `~ ${c.path}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}`;
  });
  const doc = await vscode.workspace.openTextDocument({ content: lines.join("\n"), language: "plaintext" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

export const tool = { run };
