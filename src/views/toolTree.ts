import * as vscode from "vscode";
import { CATEGORIES, TOOLS, CategoryId, ToolDefinition } from "../tools/registry";

type Node =
  | { kind: "category"; id: CategoryId; label: string }
  | { kind: "tool"; tool: ToolDefinition };

export class ToolTreeProvider implements vscode.TreeDataProvider<Node>, vscode.Disposable {
  private readonly changed = new vscode.EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData = this.changed.event;

  getTreeItem(node: Node): vscode.TreeItem {
    if (node.kind === "category") {
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item.contextValue = "devtool.category";
      return item;
    }
    const item = new vscode.TreeItem(node.tool.label, vscode.TreeItemCollapsibleState.None);
    item.description = node.tool.description;
    item.tooltip = node.tool.description;
    item.contextValue = "devtool.tool";
    item.command = {
      command: "devtool.openTool",
      title: "Open Tool",
      arguments: [node.tool.id]
    };
    return item;
  }

  getChildren(node?: Node): Node[] {
    if (!node) {
      return CATEGORIES.map((c) => ({ kind: "category", id: c.id, label: c.label }));
    }
    if (node.kind === "category") {
      return TOOLS.filter((t) => t.category === node.id).map((tool) => ({ kind: "tool", tool }));
    }
    return [];
  }

  refresh(): void {
    this.changed.fire(undefined);
  }

  dispose(): void {
    this.changed.dispose();
  }
}
