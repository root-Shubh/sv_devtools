import * as vscode from "vscode";
import { Engine, findMatches, portabilityWarnings, replacePreview } from "./playground";

// Regex Playground in native editors: the test text is an untitled document where matches
// are highlighted live. Pattern, flags and engine are chosen through input boxes and pickers.

const matchDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor("editor.findMatchHighlightBackground"),
  border: "1px solid",
  borderColor: new vscode.ThemeColor("editor.findMatchBorder")
});

let state: { pattern: string; flags: string; engine: Engine; doc?: vscode.TextDocument } = {
  pattern: "",
  flags: "",
  engine: "javascript"
};

function highlight(editor: vscode.TextEditor): void {
  const text = editor.document.getText();
  const { matches, error, truncated } = findMatches({ pattern: state.pattern, flags: state.flags, text });
  if (error) {
    editor.setDecorations(matchDecoration, []);
    return;
  }
  const ranges = matches.map((m) =>
    new vscode.Range(editor.document.positionAt(m.index), editor.document.positionAt(m.index + m.match.length))
  );
  editor.setDecorations(matchDecoration, ranges);
  if (truncated) {
    void vscode.window.setStatusBarMessage("Regex Playground: showing the first 1000 matches.", 5000);
  }
}

async function pickEngine(): Promise<Engine | undefined> {
  const picked = await vscode.window.showQuickPick(
    [
      { label: "JavaScript", engine: "javascript" as Engine, description: "Used for matching in this tool" },
      { label: "Python", engine: "python" as Engine, description: "Warnings only" },
      { label: "Java", engine: "java" as Engine, description: "Warnings only" }
    ],
    { placeHolder: "Target regex engine" }
  );
  return picked?.engine;
}

async function pickFlags(current: string): Promise<string | undefined> {
  const options = [
    { label: "i", description: "case-insensitive" },
    { label: "m", description: "multiline (^ and $ match line boundaries)" },
    { label: "s", description: "dotAll (. matches newlines)" },
    { label: "u", description: "Unicode" }
  ];
  const picked = await vscode.window.showQuickPick(
    options.map((o) => ({ ...o, picked: current.includes(o.label) })),
    { canPickMany: true, placeHolder: "Flags (g is always on)" }
  );
  return picked?.map((p) => p.label).join("");
}

async function ensureDocument(seed: string): Promise<vscode.TextEditor> {
  if (!state.doc || state.doc.isClosed) {
    state.doc = await vscode.workspace.openTextDocument({ content: seed, language: "plaintext" });
  }
  const editor = await vscode.window.showTextDocument(state.doc, { preview: false, preserveFocus: true });
  return editor;
}

export async function run(): Promise<void> {
  const active = vscode.window.activeTextEditor;
  const seed = active?.selection && !active.selection.isEmpty ? active.document.getText(active.selection) : "";

  const pattern = await vscode.window.showInputBox({
    prompt: "Regex pattern (without slashes)",
    value: state.pattern,
    placeHolder: "e.g. \d{3}-\d{4}"
  });
  if (pattern === undefined) return;
  state.pattern = pattern;

  const flags = await pickFlags(state.flags);
  if (flags === undefined) return;
  state.flags = flags;

  const engine = await pickEngine();
  if (!engine) return;
  state.engine = engine;

  const editor = await ensureDocument(seed);
  highlight(editor);

  const warnings = portabilityWarnings(state.pattern, state.flags, state.engine);
  const { matches, error } = findMatches({ pattern: state.pattern, flags: state.flags, text: editor.document.getText() });
  if (error) {
    void vscode.window.showErrorMessage(`Regex error: ${error}`);
  } else {
    const groupInfo = matches[0] && matches[0].groups.length > 0 ? ` First match groups: ${JSON.stringify(matches[0].groups)}.` : "";
    void vscode.window.showInformationMessage(`${matches.length} match(es).${groupInfo}`);
  }
  if (warnings.length > 0) {
    void vscode.window.showWarningMessage(`Engine note (${state.engine}): ${warnings.join(" ")}`);
  }
}

export function onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
  if (!state.doc || event.document !== state.doc) return;
  for (const editor of vscode.window.visibleTextEditors) {
    if (editor.document === state.doc) highlight(editor);
  }
}

export async function replace(): Promise<void> {
  if (!state.pattern) {
    void vscode.window.showInformationMessage("Run Regex Playground first to set a pattern.");
    return;
  }
  const replacement = await vscode.window.showInputBox({
    prompt: "Replacement ($1, $<name>, $& supported)",
    placeHolder: "$2 $1"
  });
  if (replacement === undefined || !state.doc) return;
  const text = state.doc.getText();
  const { result, count, error } = replacePreview({ pattern: state.pattern, flags: state.flags, text }, replacement);
  if (error) {
    void vscode.window.showErrorMessage(`Regex error: ${error}`);
    return;
  }
  // Preview only: opens a new untitled document. The source is never overwritten.
  const preview = await vscode.workspace.openTextDocument({ content: result ?? "", language: "plaintext" });
  await vscode.window.showTextDocument(preview, { preview: true });
  void vscode.window.showInformationMessage(`Replace preview: ${count} replacement(s).`);
}

export async function copyRegex(): Promise<void> {
  if (!state.pattern) {
    void vscode.window.showInformationMessage("No regex to copy yet.");
    return;
  }
  const literal = `/${state.pattern}/${state.flags}`;
  await vscode.env.clipboard.writeText(literal);
  void vscode.window.showInformationMessage(`Copied ${literal}`);
}

export const tool = { run };
