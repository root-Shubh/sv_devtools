import * as vscode from "vscode";
import { unifiedDiff } from "./diff";

// Quick Diff: compare selection vs clipboard, two selections, or two files.
// Results open in the native diff editor, or as a unified diff document.

let firstSelection: string | undefined;

export async function selectionVsClipboard(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  if (!selected) {
    void vscode.window.showInformationMessage("Select some text first.");
    return;
  }
  const clip = await vscode.env.clipboard.readText();
  await openDiff(selected, clip, "Selection vs Clipboard");
}

export async function twoSelections(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  if (!selected) {
    void vscode.window.showInformationMessage("Select some text first.");
    return;
  }
  if (firstSelection === undefined) {
    firstSelection = selected;
    void vscode.window.showInformationMessage("First selection saved. Select the second block and run Quick Diff again.");
    return;
  }
  const first = firstSelection;
  firstSelection = undefined;
  await openDiff(first, selected, "Selection A vs Selection B");
}

export async function twoFiles(): Promise<void> {
  const pick = () =>
    vscode.window.showOpenDialog({ canSelectMany: false, openLabel: "Select file" });
  const a = await pick();
  if (!a?.[0]) return;
  const b = await pick();
  if (!b?.[0]) return;
  await vscode.commands.executeCommand("vscode.diff", a[0], b[0], "File vs File");
}

// Opens the native diff editor for two texts, plus a unified text view.
export async function openDiff(left: string, right: string, title: string): Promise<void> {
  const leftDoc = await vscode.workspace.openTextDocument({ content: left, language: "plaintext" });
  const rightDoc = await vscode.workspace.openTextDocument({ content: right, language: "plaintext" });
  await vscode.commands.executeCommand("vscode.diff", leftDoc.uri, rightDoc.uri, title);
  const unified = unifiedDiff(left, right);
  if (unified) {
    const doc = await vscode.workspace.openTextDocument({ content: unified, language: "diff" });
    await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  } else {
    void vscode.window.showInformationMessage("The two texts are identical.");
  }
}

export async function run(): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    [
      { label: "Selection vs Clipboard", id: "clip" },
      { label: "Two Selections", id: "sel" },
      { label: "Two Files", id: "files" }
    ],
    { placeHolder: "Quick Diff mode" }
  );
  if (!pick) return;
  if (pick.id === "clip") await selectionVsClipboard();
  else if (pick.id === "sel") await twoSelections();
  else await twoFiles();
}

export const tool = { run };
