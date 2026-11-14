import * as vscode from "vscode";
import { CATEGORIES, TOOLS, ToolDefinition } from "../tools/registry";

interface ToolPick extends vscode.QuickPickItem {
  toolId: string;
}

// Pure filter, kept free of VS Code types so it can be unit tested.
export function filterTools(query: string, tools: readonly ToolDefinition[] = TOOLS): ToolDefinition[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return [...tools];
  }
  return tools.filter((tool) => {
    const category = CATEGORIES.find((c) => c.id === tool.category)?.label ?? "";
    const haystack = `${tool.label} ${tool.description} ${category}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export async function searchTools(): Promise<string | undefined> {
  const picker = vscode.window.createQuickPick<ToolPick>();
  picker.placeholder = "Search Dev Tool utilities";
  picker.matchOnDescription = true;

  const toItems = (query: string): ToolPick[] =>
    filterTools(query).map((tool) => ({
      label: tool.label,
      description: CATEGORIES.find((c) => c.id === tool.category)?.label,
      detail: tool.description,
      toolId: tool.id
    }));

  picker.items = toItems("");
  picker.onDidChangeValue((value) => {
    picker.items = toItems(value);
  });

  return new Promise<string | undefined>((resolve) => {
    picker.onDidAccept(() => {
      const selected = picker.selectedItems[0];
      resolve(selected?.toolId);
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve(undefined);
      picker.dispose();
    });
    picker.show();
  });
}
