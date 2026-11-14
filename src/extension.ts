import * as vscode from "vscode";
import { ToolTreeProvider } from "./views/toolTree";
import { TOOLS } from "./tools/registry";

export function activate(context: vscode.ExtensionContext): void {
  const tree = new ToolTreeProvider();
  const view = vscode.window.createTreeView("devtool.tools", {
    treeDataProvider: tree,
    showCollapseAll: true
  });

  context.subscriptions.push(
    tree,
    view,
    vscode.commands.registerCommand("devtool.openTool", (toolId: string) => {
      const tool = TOOLS.find((t) => t.id === toolId);
      // Phase 1: tools are not implemented yet. Later phases load each tool lazily here.
      void vscode.window.showInformationMessage(
        tool ? `${tool.label} is not implemented yet.` : `Unknown tool: ${toolId}`
      );
    })
  );
}

export function deactivate(): void {
  // Nothing to clean up: all disposables are registered on the extension context.
}
