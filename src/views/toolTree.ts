import * as vscode from "vscode";
import { CATEGORIES, TOOLS, CategoryId, ToolDefinition } from "../tools/registry";
import { ToolState } from "../state/toolState";

type Node =
  | { kind: "section"; id: "favorites" | "recent"; label: string }
  | { kind: "category"; id: CategoryId; label: string }
  | { kind: "tool"; tool: ToolDefinition; inSection: boolean };

export class ToolTreeProvider implements vscode.TreeDataProvider<Node>, vscode.Disposable {
  private readonly changed = new vscode.EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData = this.changed.event;

  constructor(private readonly state: ToolState) {}

  getTreeItem(node: Node): vscode.TreeItem {
    if (node.kind === "section") {
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item.contextValue = "devtool.section";
      return item;
    }
    if (node.kind === "category") {
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item.contextValue = "devtool.category";
      return item;
    }
    const favorite = this.state.isFavorite(node.tool.id);
    const item = new vscode.TreeItem(node.tool.label, vscode.TreeItemCollapsibleState.None);
    item.description = node.tool.description;
    item.tooltip = node.tool.description;
    // Screen readers get the name, purpose and favourite state in one phrase.
    item.accessibilityInformation = {
      label: `${node.tool.label}. ${node.tool.description}.${favorite ? " Favourite." : ""}`,
      role: "button"
    };
    item.contextValue = favorite ? "devtool.tool.favorite" : "devtool.tool";
    item.iconPath = new vscode.ThemeIcon(favorite ? "star-full" : "symbol-misc");
    item.command = {
      command: "devtool.openTool",
      title: "Open Tool",
      arguments: [node.tool.id]
    };
    return item;
  }

  getChildren(node?: Node): Node[] {
    if (!node) {
      const sections: Node[] = [];
      const favorites = this.toolsFor(this.state.getFavorites());
      if (favorites.length > 0) {
        sections.push({ kind: "section", id: "favorites", label: "Favorites" });
      }
      const recent = this.toolsFor(this.state.getRecent());
      if (recent.length > 0) {
        sections.push({ kind: "section", id: "recent", label: "Recently Used" });
      }
      const categories: Node[] = CATEGORIES.map((c) => ({ kind: "category", id: c.id, label: c.label }));
      return [...sections, ...categories];
    }
    if (node.kind === "section") {
      const ids = node.id === "favorites" ? this.state.getFavorites() : this.state.getRecent();
      return this.toolsFor(ids).map((tool) => ({ kind: "tool", tool, inSection: true }));
    }
    if (node.kind === "category") {
      return TOOLS.filter((t) => t.category === node.id).map((tool) => ({ kind: "tool", tool, inSection: false }));
    }
    return [];
  }

  refresh(): void {
    this.changed.fire(undefined);
  }

  dispose(): void {
    this.changed.dispose();
  }

  private toolsFor(ids: string[]): ToolDefinition[] {
    return ids
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter((t): t is ToolDefinition => t !== undefined);
  }
}
