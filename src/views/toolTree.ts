import * as vscode from "vscode";
import { CATEGORIES, TOOLS, CategoryId, ToolDefinition } from "../tools/registry";
import { ToolState } from "../state/toolState";
import { CATEGORY_ICONS, TOOL_ICONS } from "./icons";

type Node =
  | { kind: "section"; id: "favorites" | "recent"; label: string; count: number }
  | { kind: "category"; id: CategoryId; label: string; count: number }
  | { kind: "tool"; tool: ToolDefinition };

export class ToolTreeProvider implements vscode.TreeDataProvider<Node>, vscode.Disposable {
  private readonly changed = new vscode.EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData = this.changed.event;

  constructor(private readonly state: ToolState) {}

  getTreeItem(node: Node): vscode.TreeItem {
    if (node.kind === "section") {
      const icon = node.id === "favorites" ? "star-full" : "history";
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon(icon);
      item.description = `${node.count}`;
      item.contextValue = "devtool.section";
      return item;
    }
    if (node.kind === "category") {
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon(CATEGORY_ICONS[node.id]);
      item.description = `${node.count} ${node.count === 1 ? "tool" : "tools"}`;
      item.contextValue = "devtool.category";
      return item;
    }

    const favorite = this.state.isFavorite(node.tool.id);
    const item = new vscode.TreeItem(node.tool.label, vscode.TreeItemCollapsibleState.None);
    item.description = favorite ? `★ ${node.tool.description}` : node.tool.description;
    item.iconPath = new vscode.ThemeIcon(TOOL_ICONS[node.tool.id] ?? "symbol-misc");
    const tip = new vscode.MarkdownString(undefined, true);
    tip.appendMarkdown(`**${node.tool.label}**\n\n${node.tool.description}\n\n`);
    tip.appendMarkdown(
      favorite ? "★ Favourite. Use *Toggle Favorite* to remove.\n\n" : "Click to open. Use the star to pin it."
    );
    item.tooltip = tip;
    // Screen readers get the name, purpose and favourite state in one phrase.
    item.accessibilityInformation = {
      label: `${node.tool.label}. ${node.tool.description}.${favorite ? " Favourite." : ""}`,
      role: "button"
    };
    item.contextValue = favorite ? "devtool.tool.favorite" : "devtool.tool";
    item.command = { command: "devtool.openTool", title: "Open Tool", arguments: [node.tool.id] };
    return item;
  }

  getChildren(node?: Node): Node[] {
    if (!node) {
      const sections: Node[] = [];
      const favorites = this.toolsFor(this.state.getFavorites());
      if (favorites.length > 0) {
        sections.push({ kind: "section", id: "favorites", label: "Favourites", count: favorites.length });
      }
      const recent = this.toolsFor(this.state.getRecent());
      if (recent.length > 0) {
        sections.push({ kind: "section", id: "recent", label: "Recently Used", count: recent.length });
      }
      const categories: Node[] = CATEGORIES.map((c) => ({
        kind: "category",
        id: c.id,
        label: c.label,
        count: TOOLS.filter((t) => t.category === c.id).length
      }));
      return [...sections, ...categories];
    }
    if (node.kind === "section") {
      const ids = node.id === "favorites" ? this.state.getFavorites() : this.state.getRecent();
      return this.toolsFor(ids).map((tool) => ({ kind: "tool", tool }));
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

  private toolsFor(ids: string[]): ToolDefinition[] {
    return ids.map((id) => TOOLS.find((t) => t.id === id)).filter((t): t is ToolDefinition => t !== undefined);
  }
}
