import * as vscode from "vscode";
import { randomString, generatePassword, loremIpsum, sampleJson, sqlInserts, CHARSETS } from "./generators";

// One place for the generator tools. Every output is shown in a new document and copied to the clipboard.
async function output(text: string, label: string): Promise<void> {
  await vscode.env.clipboard.writeText(text);
  const doc = await vscode.workspace.openTextDocument({ content: text, language: "plaintext" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  void vscode.window.showInformationMessage(`${label} copied to clipboard.`);
}

async function askNumber(prompt: string, fallback: string): Promise<number | undefined> {
  const v = await vscode.window.showInputBox({ prompt, value: fallback, validateInput: (x) => (/^\d+$/.test(x) ? undefined : "Enter a whole number") });
  return v === undefined ? undefined : Number(v);
}

async function randomStringFlow(): Promise<void> {
  const length = await askNumber("Length", "24");
  if (length === undefined) return;
  const set = await vscode.window.showQuickPick(
    [
      { label: "Letters and digits", value: CHARSETS.alnum },
      { label: "Letters only", value: CHARSETS.alpha },
      { label: "Digits only", value: CHARSETS.digits },
      { label: "Hex", value: CHARSETS.hex }
    ],
    { placeHolder: "Character set" }
  );
  if (!set) return;
  await output(randomString(length, set.value), "Random string");
}

async function passwordFlow(): Promise<void> {
  const length = await askNumber("Password length", "16");
  if (length === undefined) return;
  const picks = await vscode.window.showQuickPick(
    [
      { label: "Uppercase", picked: true },
      { label: "Lowercase", picked: true },
      { label: "Digits", picked: true },
      { label: "Symbols", picked: true }
    ],
    { canPickMany: true, placeHolder: "Character types" }
  );
  if (!picks) return;
  const has = (l: string) => picks.some((p) => p.label === l);
  const result = generatePassword({
    length,
    upper: has("Uppercase"),
    lower: has("Lowercase"),
    digits: has("Digits"),
    symbols: has("Symbols")
  });
  if (typeof result === "object") {
    void vscode.window.showErrorMessage(result.error);
    return;
  }
  await output(result, "Password");
}

async function loremFlow(): Promise<void> {
  const words = await askNumber("Number of words", "50");
  if (words === undefined) return;
  await output(loremIpsum(words), "Lorem Ipsum");
}

async function sampleJsonFlow(): Promise<void> {
  const spec = await vscode.window.showInputBox({
    prompt: "Fields as name:type (types: int, float, string, bool, date, uuid)",
    value: "id:int, name:string, active:bool, created:date"
  });
  if (!spec) return;
  const rows = await askNumber("Number of objects", "5");
  if (rows === undefined) return;
  const r = sampleJson(spec, rows);
  if (!r.ok) return void vscode.window.showErrorMessage(r.message);
  await output(r.text, "Sample JSON");
}

async function sqlFlow(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const source = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  const json = source || (await vscode.window.showInputBox({ prompt: "JSON array of objects (or select it in the editor first)" }));
  if (!json) return;
  const table = await vscode.window.showInputBox({ prompt: "Table name", value: "my_table" });
  if (!table) return;
  const r = sqlInserts(table, json);
  if (!r.ok) return void vscode.window.showErrorMessage(r.message);
  await output(r.text, "SQL INSERT");
}

export async function run(): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    [
      { label: "Random string", run: randomStringFlow },
      { label: "Password", run: passwordFlow },
      { label: "Lorem Ipsum", run: loremFlow },
      { label: "Sample JSON", run: sampleJsonFlow },
      { label: "SQL INSERT from JSON", run: sqlFlow }
    ],
    { placeHolder: "Generator" }
  );
  if (pick) await pick.run();
}

export const tool = { run };
