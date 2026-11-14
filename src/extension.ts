import * as vscode from "vscode";
import { ToolTreeProvider } from "./views/toolTree";
import { searchTools } from "./views/searchTools";
import { TOOLS } from "./tools/registry";
import { ToolState } from "./state/toolState";
import { loadTool, registerTool } from "./tools/loader";
import { registerContextActions } from "./ui/contextActions";
import { registerFileActions } from "./ui/fileActions";

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
  registerContextActions(context);
  registerFileActions(context);
  registerTool("developer-references", async () => (await import("./tools/developer/referencesTool")).tool);
  registerTool("developer-utilities", async () => (await import("./tools/developer/utilitiesTool")).tool);
  registerTool("jwt-decode", async () => (await import("./tools/developer/jwtTool")).tool);
  registerTool("timestamps", async () => (await import("./tools/encoding/timestampsTool")).tool);
  registerTool("json-utilities", async () => (await import("./tools/json/utilitiesTool")).tool);
  context.subscriptions.push(
    vscode.commands.registerCommand("devtool.jsonFormat", async () => (await import("./tools/json/jsonTool")).run())
  );
  const regex = () => import("./tools/regex/regexTool");
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async (e) => (await regex()).onDocumentChanged(e))
  );
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
    const loading = loadTool(tool.id);
    if (!loading) {
      void vscode.window.showErrorMessage(`${tool.label} has no loader registered.`);
      return;
    }
    await state.markUsed(toolId);
    tree.refresh();
    try {
      const module = await loading;
      await module.run();
    } catch (err) {
      void vscode.window.showErrorMessage(`${tool.label} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
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
    }),
    vscode.commands.registerCommand("devtool.showTools", () =>
      vscode.commands.executeCommand("workbench.view.extension.devtool")
    ),
    vscode.commands.registerCommand("devtool.refreshTools", () => tree.refresh()),
    vscode.commands.registerCommand("devtool.clearState", async () => {
      await state.reset();
      tree.refresh();
      void vscode.window.showInformationMessage("Dev Tool: favourites and recently used tools cleared.");
    }),
    vscode.commands.registerCommand("devtool.reloadWindow", () =>
      // Reloading the window restarts every extension, including Dev Tool.
      vscode.commands.executeCommand("workbench.action.reloadWindow")
    ),
    vscode.commands.registerCommand("devtool.openWorkbench", async () =>
      (await import("./ui/workbench")).openWorkbench(context)
    ),
    vscode.commands.registerCommand("devtool.version", () =>
      vscode.window.showInformationMessage(`Dev Tool version ${String(context.extension.packageJSON.version)}`)
    )
  );
}

export function deactivate(): void {
  // Nothing to clean up: all disposables are registered on the extension context.
}
