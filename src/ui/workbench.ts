import * as vscode from "vscode";
import { randomBytes } from "crypto";
import { TRANSFORMS, runTransform } from "../workbench/transforms";
import { buildWorkbenchHtml } from "../workbench/html";

// The Workbench: one panel with input and output side by side. Only one panel is open at a time.
// Transforms run in the extension (pure code), and the webview only handles the interface.

let panel: vscode.WebviewPanel | undefined;
let target: vscode.TextEditor | undefined; // editor that Replace writes to

function selectedText(editor: vscode.TextEditor | undefined): string {
  return editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
}

function nonce(): string {
  return randomBytes(16).toString("base64");
}

async function onMessage(msg: { type: string; id?: string; input?: string; text?: string }): Promise<void> {
  if (!panel) return;
  switch (msg.type) {
    case "transform": {
      const result = runTransform(msg.id ?? "", msg.input ?? "");
      void panel.webview.postMessage({ type: "result", result });
      return;
    }
    case "copy": {
      await vscode.env.clipboard.writeText(msg.text ?? "");
      void panel.webview.postMessage({ type: "status", message: "Copied to clipboard." });
      return;
    }
    case "replace": {
      const editor = target && vscode.window.visibleTextEditors.includes(target) ? target : undefined;
      if (!editor || editor.selection.isEmpty) {
        void panel.webview.postMessage({
          type: "status",
          message: "Select text in an editor first, then open the Workbench from that editor to replace it.",
          error: true
        });
        return;
      }
      const ok = await editor.edit((b) => b.replace(editor.selection, msg.text ?? ""));
      void panel.webview.postMessage({
        type: "status",
        message: ok ? "Selection replaced." : "The editor did not accept the change.",
        error: !ok
      });
      return;
    }
  }
}

export function openWorkbench(context: vscode.ExtensionContext): void {
  const active = vscode.window.activeTextEditor;
  target = active;
  const seed = selectedText(active);

  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside, true);
    void panel.webview.postMessage({ type: "init", input: seed });
    return;
  }

  panel = vscode.window.createWebviewPanel("devtool.workbench", "Dev Tool Workbench", vscode.ViewColumn.Beside, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: []
  });
  const n = nonce();
  panel.webview.html = buildWorkbenchHtml({
    nonce: n,
    cspSource: panel.webview.cspSource,
    transforms: TRANSFORMS.map((t) => ({ id: t.id, label: t.label, group: t.group })),
    initialInput: seed
  });
  panel.webview.onDidReceiveMessage((msg) => void onMessage(msg), undefined, context.subscriptions);
  panel.onDidDispose(() => {
    panel = undefined;
    target = undefined;
  }, undefined, context.subscriptions);
}
