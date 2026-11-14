import * as vscode from "vscode";
import { decodeJwt, claimDates } from "./jwt";

// Decodes a JWT from the selection or an input box, and shows the result in a new document.
export async function run(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  const token =
    selected || (await vscode.window.showInputBox({ prompt: "Paste a JWT (decoded locally, signature not verified)" }));
  if (!token) return;

  const r = decodeJwt(token);
  if (!r.ok) {
    void vscode.window.showErrorMessage(r.message);
    return;
  }
  // Optional HMAC check. The secret is used for this call only and is never stored.
  let verification: string[] = [];
  const choice = await vscode.window.showQuickPick(["Skip verification", "Verify with a secret (HMAC)"], {
    placeHolder: "Verify the signature too?"
  });
  if (choice?.startsWith("Verify")) {
    const secret = await vscode.window.showInputBox({
      prompt: "Secret (used once for this check, not saved)",
      password: true
    });
    if (secret) {
      const { verifyJwtHmac } = await import("./jwtVerify");
      const v = verifyJwtHmac(token, secret);
      verification = ["== Signature check ==", v.ok ? (v.valid ? "✔ " : "✘ ") + v.message : `! ${v.message}`, ""];
    }
  }

  const lines = [
    ...verification,
    "== Notes ==",
    ...r.value.notes.map((n) => `! ${n}`),
    "",
    "== Header ==",
    JSON.stringify(r.value.header, null, 2),
    "",
    "== Payload ==",
    JSON.stringify(r.value.payload, null, 2),
    "",
    "== Time claims (UTC) ==",
    ...Object.entries(claimDates(r.value.payload)).map(([k, v]) => `${k}: ${v}`),
    "",
    "== Signature (not verified) ==",
    r.value.signature
  ];
  const doc = await vscode.workspace.openTextDocument({ content: lines.join("\n"), language: "json" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

export const tool = { run };
