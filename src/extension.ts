import * as vscode from "vscode";
import { ToolTreeProvider } from "./views/toolTree";
import { searchTools } from "./views/searchTools";
import { TOOLS } from "./tools/registry";
import { ToolState } from "./state/toolState";
import { hasTool, loadTool, registerTool } from "./tools/loader";

export function activate(context: vscode.ExtensionContext): void {
  registerTool("text-diff", async () => (await import("./tools/text/diffTool")).tool);
  const diff = () => import("./tools/text/diffTool");
  const state = new ToolState(context.globalState);
  const tree = new ToolTreeProvider(state);
  const view = vscode.window.createTreeView("devtool.tools", {
    treeDataProvider: tree,
    showCollapseAll: true
  });

  const openTool = async (toolId: string) => {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (!tool) {
      void vscode.window.showInformationMessage(`Unknown tool: ${toolId}`);
      return;
    }
    await state.markUsed(toolId);
    tree.refresh();
    // Tools are not implemented yet. Later phases load each tool lazily here.
    void vscode.window.showInformationMessage(`${tool.label} is not implemented yet.`);
  };

  context.subscriptions.push(
    tree,
    view,
    vscode.commands.registerCommand("devtool.openTool", openTool),
    vscode.commands.registerCommand("devtool.searchTools", async () => {
      const toolId = await searchTools();
      if (toolId) {
        await openTool(toolId);
      }
    }),
    vscode.commands.registerCommand("devtool.diffSwap", async () => (await diff()).swap()),
    vscode.commands.registerCommand("devtool.diffClear", async () => (await diff()).clear()),
    vscode.commands.registerCommand("devtool.diffSummary", async () => (await diff()).summarize()),
    vscode.commands.registerCommand("devtool.diffCopy", async () => (await diff()).copyDifferences()),
    vscode.commands.registerCommand("devtool.toggleFavorite", async (node?: { tool?: { id: string } }) => {
      const toolId = node?.tool?.id;
      if (toolId) {
        await state.toggleFavorite(toolId);
        tree.refresh();
      }
    })
  );
}

export function deactivate(): void {
  // Nothing to clean up: all disposables are registered on the extension context.
}
