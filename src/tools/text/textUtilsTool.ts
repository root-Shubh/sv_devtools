import * as vscode from "vscode";
import { runTransform, pickAction } from "../../ui/transform";
import * as t from "./textUtils";

export async function run(): Promise<void> {
  await pickAction("Text utilities", [
    { label: "Remove duplicate lines", run: () => runTransform("Dedupe", (x) => ({ ok: true, text: t.removeDuplicateLines(x) })) },
    { label: "Sort lines (A-Z)", run: () => runTransform("Sort", (x) => ({ ok: true, text: t.sortLines(x) })) },
    { label: "Sort lines (Z-A)", run: () => runTransform("Sort", (x) => ({ ok: true, text: t.sortLines(x, { descending: true }) })) },
    { label: "Reverse lines", run: () => runTransform("Reverse", (x) => ({ ok: true, text: t.reverseLines(x) })) },
    { label: "Trim whitespace on each line", run: () => runTransform("Trim", (x) => ({ ok: true, text: t.trimLines(x) })) },
    { label: "Remove empty lines", run: () => runTransform("Remove empty lines", (x) => ({ ok: true, text: t.removeEmptyLines(x) })) },
    { label: "Convert line endings to LF", run: () => runTransform("Line endings", (x) => ({ ok: true, text: t.convertLineEndings(x, "lf") })) },
    { label: "Convert line endings to CRLF", run: () => runTransform("Line endings", (x) => ({ ok: true, text: t.convertLineEndings(x, "crlf") })) },
    { label: "Find and replace", run: findAndReplace },
    { label: "Count characters, words and lines", run: countStats }
  ]);
}

async function findAndReplace(): Promise<void> {
  const find = await vscode.window.showInputBox({ prompt: "Find" });
  if (find === undefined || find === "") return;
  const replacement = await vscode.window.showInputBox({ prompt: "Replace with" });
  if (replacement === undefined) return;
  const mode = await vscode.window.showQuickPick(["Literal", "Regex", "Literal, ignore case"], { placeHolder: "Match mode" });
  if (!mode) return;
  await runTransform("Find and replace", (x) => {
    const r = t.findReplace(x, find, replacement, { useRegex: mode === "Regex", ignoreCase: mode.endsWith("ignore case") });
    return r.error ? { ok: false, message: r.error } : { ok: true, text: `${r.text}` };
  });
}

async function countStats(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const text = editor ? editor.document.getText(editor.selection.isEmpty ? undefined : editor.selection) : "";
  const s = t.countStats(text);
  void vscode.window.showInformationMessage(`Characters: ${s.characters}, words: ${s.words}, lines: ${s.lines}`);
}

export const tool = { run };
