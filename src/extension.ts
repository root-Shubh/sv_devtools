import * as vscode from "vscode";
import { ToolTreeProvider } from "./views/toolTree";
import { searchTools } from "./views/searchTools";
import { TOOLS } from "./tools/registry";
import { ToolState } from "./state/toolState";
import { hasTool, loadTool, registerTool } from "./tools/loader";

export function activate(context: vscode.ExtensionContext): void {
  registerTool("text-diff", async () => (await import("./tools/text/diffTool")).tool);
  registerTool("quick-diff", async () => (await import("./tools/text/quickDiff")).tool);
  const quick = () => import("./tools/text/quickDiff");
  registerTool("regex-playground", async () => (await import("./tools/regex/regexTool")).tool);
  registerTool("regex-library", async () => (await import("./tools/regex/libraryTool")).tool);
  registerTool("json-format", async () => (await import("./tools/json/jsonTool")).tool);
  registerTool("json-compare", async () => (await import("./tools/json/compareTool")).tool);
  registerTool("base64", async () => (await import("./tools/encoding/base64Tool")).tool);
  registerTool("url-encode", async () => (await import("./tools/encoding/urlTool")).tool);
  registerTool("uuid", async () => (await import("./tools/generators/uuidTool")).tool);
  registerTool("hash", async () => (await import("./tools/generators/hashTool")).tool);
  registerTool("text-utilities", async () => (await import("./tools/text/textUtilsTool")).tool);
  registerTool("json-to-ts", async () => (await import("./tools/json/toTsTool")).tool);
  registerTool("encoding-conversion", async () => (await import("./tools/encoding/conversionTool")).tool);
  registerTool("generators", async () => (await import("./tools/generators/generatorsTool")).tool);
  registerTool("developer-utilities", async () => (await import("./tools/developer/utilitiesTool")).tool);
  registerTool("jwt-decode", async () => (await import("./tools/developer/jwtTool")).tool);
  registerTool("timestamps", async () => (await import("./tools/encoding/timestampsTool")).tool);
  registerTool("json-utilities", async () => (await import("./tools/json/utilitiesTool")).tool);
  context.subscriptions.push(vscode.commands.registerCommand("devtool.jsonFormat", async () => (await import("./tools/json/jsonTool")).run()));
  const regex = () => import("./tools/regex/regexTool");
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(async (e) => (await regex()).onDocumentChanged(e)));
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
    vscode.commands.registerCommand("devtool.regexReplace", async () => (await regex()).replace()),
    vscode.commands.registerCommand("devtool.regexCopy", async () => (await regex()).copyRegex()),
    vscode.commands.registerCommand("devtool.quickClipboard", async () => (await quick()).selectionVsClipboard()),
    vscode.commands.registerCommand("devtool.quickTwoSelections", async () => (await quick()).twoSelections()),
    vscode.commands.registerCommand("devtool.quickFiles", async () => (await quick()).twoFiles()),
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
