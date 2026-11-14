import * as vscode from "vscode";
import { diffLines, diffSummary, DiffLine, DiffOptions } from "./diff";

// Native side-by-side diff: two untitled editors shown with VS Code's diff view.
// Nothing is written to disk; the inputs live in untitled documents.

let left: vscode.TextDocument | undefined;
let right: vscode.TextDocument | undefined;

async function openPair(leftText: string, rightText: string): Promise<void> {
  left = await vscode.workspace.openTextDocument({ content: leftText, language: "plaintext" });
  right = await vscode.workspace.openTextDocument({ content: rightText, language: "plaintext" });
  await vscode.commands.executeCommand("vscode.diff", left.uri, right.uri, "Text Diff");
}

async function pickOptions(): Promise<DiffOptions | undefined> {
  const items = [
    { label: "Ignore whitespace", picked: false, key: "ignoreWhitespace" },
    { label: "Ignore case", picked: false, key: "ignoreCase" }
  ];
  const picked = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    placeHolder: "Diff options (optional)"
  });
  if (!picked) {
    return undefined;
  }
  return {
    ignoreWhitespace: picked.some((p) => p.key === "ignoreWhitespace"),
    ignoreCase: picked.some((p) => p.key === "ignoreCase")
  };
}

export function formatDifferences(lines: DiffLine[]): string {
  return lines
    .filter((l) => l.kind !== "equal")
    .map((l) => (l.kind === "added" ? `+ ${l.text}` : `- ${l.text}`))
    .join("\n");
}

export async function run(): Promise<void> {
  const seed = vscode.window.activeTextEditor?.document.getText(
    vscode.window.activeTextEditor.selection
  ) ?? "";
  await openPair(seed, "");
  void vscode.window.showInformationMessage("Paste text into both sides to compare. Use Dev Tool: Swap Diff Sides or Clear Diff Inputs as needed.");
}

export async function swap(): Promise<void> {
  if (!left || !right) {
    void vscode.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  await openPair(right.getText(), left.getText());
}

export async function clear(): Promise<void> {
  if (!left || !right) {
    void vscode.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  await openPair("", "");
}

export async function summarize(): Promise<void> {
  if (!left || !right) {
    void vscode.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  const options = await pickOptions();
  if (!options) {
    return;
  }
  try {
    const lines = diffLines(left.getText(), right.getText(), options);
    const s = diffSummary(lines);
    void vscode.window.showInformationMessage(`+${s.added} added, -${s.removed} removed, ${s.equal} unchanged.`);
  } catch (err) {
    void vscode.window.showErrorMessage(err instanceof Error ? err.message : "Diff failed.");
  }
}

export async function copyDifferences(): Promise<void> {
  if (!left || !right) {
    void vscode.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  const options = await pickOptions();
  if (!options) {
    return;
  }
  try {
    const text = formatDifferences(diffLines(left.getText(), right.getText(), options));
    await vscode.env.clipboard.writeText(text);
    void vscode.window.showInformationMessage(text ? "Differences copied to clipboard." : "No differences to copy.");
  } catch (err) {
    void vscode.window.showErrorMessage(err instanceof Error ? err.message : "Diff failed.");
  }
}

// Module shape the loader expects.
export const tool = { run };
