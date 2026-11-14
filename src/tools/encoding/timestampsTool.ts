import * as vscode from "vscode";
import { timestampToDate, dateToTimestamp, formatUtc, formatInZone } from "./timestamps";

// Timestamp converter. Input comes from the selection, or an input box.
async function inputOrSelection(prompt: string): Promise<string | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (editor && !editor.selection.isEmpty) return editor.document.getText(editor.selection);
  return vscode.window.showInputBox({ prompt });
}

async function showResult(lines: string[]): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({ content: lines.join("\n"), language: "plaintext" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

export async function run(): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    [
      { label: "Timestamp to date", id: "toDate" },
      { label: "Date to timestamp", id: "toTs" },
      { label: "Current time", id: "now" }
    ],
    { placeHolder: "Timestamp converter" }
  );
  if (!pick) return;

  if (pick.id === "now") {
    const now = new Date();
    await showResult([
      `Seconds: ${Math.floor(now.getTime() / 1000)}`,
      `Milliseconds: ${now.getTime()}`,
      `UTC: ${formatUtc(now).readable}`,
      `Local: ${formatInZone(now, Intl.DateTimeFormat().resolvedOptions().timeZone)}`
    ]);
    return;
  }

  const input = await inputOrSelection(
    pick.id === "toDate" ? "Unix seconds or milliseconds" : "Date (ISO 8601 recommended)"
  );
  if (input === undefined) return;

  if (pick.id === "toDate") {
    const r = timestampToDate(input);
    if (!r.ok) return void vscode.window.showErrorMessage(r.message);
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const f = formatUtc(r.value.date);
    await showResult([
      `Input unit: ${r.value.unit}`,
      `ISO 8601: ${f.iso}`,
      `UTC: ${f.readable}`,
      `Local: ${formatInZone(r.value.date, zone)}`
    ]);
  } else {
    const r = dateToTimestamp(input);
    if (!r.ok) return void vscode.window.showErrorMessage(r.message);
    await showResult([`Seconds: ${r.value.seconds}`, `Milliseconds: ${r.value.milliseconds}`]);
  }
}

export const tool = { run };
