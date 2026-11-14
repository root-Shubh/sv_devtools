import * as vscode from "vscode";
import { generateUuids } from "./uuid";

// Generates UUIDs into a new document and copies them to the clipboard on request.
export async function run(): Promise<void> {
  const countPick = await vscode.window.showQuickPick(["1", "5", "10", "25", "100"], { placeHolder: "How many UUIDs?" });
  if (!countPick) return;
  const format = await vscode.window.showQuickPick(
    ["Lowercase, with dashes", "Uppercase, with dashes", "Lowercase, no dashes"],
    { placeHolder: "Format" }
  );
  if (!format) return;
  const ids = generateUuids({
    count: Number(countPick),
    uppercase: format.startsWith("Uppercase"),
    noDashes: format.endsWith("no dashes")
  });
  const text = ids.join("\n");
  await vscode.env.clipboard.writeText(text);
  const doc = await vscode.workspace.openTextDocument({ content: text, language: "plaintext" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  void vscode.window.showInformationMessage(`${ids.length} UUID(s) generated and copied.`);
}

export const tool = { run };
