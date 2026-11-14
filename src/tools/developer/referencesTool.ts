import * as vscode from "vscode";
import { formatXml, visualiseEscapes, HTTP_STATUS, MIME_TYPES } from "./references";
import { runTransform, pickAction } from "../../ui/transform";

async function showList(title: string, lines: string[]): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({
    content: `${title}\n\n${lines.join("\n")}`,
    language: "plaintext"
  });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

async function markdownPreview(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const text =
    editor && !editor.selection.isEmpty
      ? editor.document.getText(editor.selection)
      : (editor?.document.getText() ?? "");
  const doc = await vscode.workspace.openTextDocument({ content: text, language: "markdown" });
  await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
}

async function escapes(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const text =
    editor && !editor.selection.isEmpty
      ? editor.document.getText(editor.selection)
      : await vscode.window.showInputBox({ prompt: "Text to visualise" });
  if (text === undefined) return;
  await showList("Escape visualiser (char, code point, meaning)", [visualiseEscapes(text)]);
}

async function httpStatus(): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    HTTP_STATUS.map((s) => ({ label: `${s.code} ${s.name}`, description: s.meaning })),
    { placeHolder: "HTTP status codes", matchOnDescription: true }
  );
  if (!pick) return;
  await showList(
    "HTTP status codes",
    HTTP_STATUS.map((s) => `${s.code}  ${s.name.padEnd(24)} ${s.meaning}`)
  );
}

async function mimeTypes(): Promise<void> {
  await showList(
    "Common MIME types",
    MIME_TYPES.map((m) => `${m.ext.padEnd(8)} ${m.mime.padEnd(36)} ${m.use}`)
  );
}

export async function run(): Promise<void> {
  await pickAction("Developer references", [
    { label: "XML: format and validate", run: () => runTransform("XML", (x) => formatXml(x), "xml") },
    { label: "Markdown preview", run: markdownPreview },
    { label: "Escape visualiser", run: escapes },
    { label: "HTTP status codes", run: httpStatus },
    { label: "MIME types", run: mimeTypes }
  ]);
}

export const tool = { run };
