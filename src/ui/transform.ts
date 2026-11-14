import * as vscode from "vscode";

// Shared flow for text tools: take the selection (or whole document), transform it,
// show the output in a new document, and replace the source only if the user asks.

export type Transform = (input: string) => { ok: true; text: string } | { ok: false; message: string };

export async function runTransform(label: string, transform: Transform, language = "plaintext"): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const useSelection = !!editor && !editor.selection.isEmpty;
  const range = editor
    ? useSelection
      ? editor.selection
      : new vscode.Range(0, 0, editor.document.lineCount, 0)
    : undefined;
  const input = editor && range ? editor.document.getText(range) : "";

  let result: ReturnType<Transform>;
  try {
    result = transform(input);
  } catch (err) {
    result = { ok: false, message: err instanceof Error ? err.message : "Transform failed." };
  }
  if (!result.ok) {
    void vscode.window.showErrorMessage(`${label}: ${result.message}`);
    return;
  }
  const doc = await vscode.workspace.openTextDocument({ content: result.text, language });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });

  if (editor && range) {
    const replace = "Replace source";
    const choice = await vscode.window.showInformationMessage(`${label}: done.`, replace);
    if (choice === replace) {
      await editor.edit((b) => b.replace(range, result.text));
    }
  }
}

export async function pickAction(
  placeHolder: string,
  actions: { label: string; run: () => Promise<void> }[]
): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    actions.map((a) => ({ label: a.label, action: a })),
    { placeHolder }
  );
  if (pick) await pick.action.run();
}
