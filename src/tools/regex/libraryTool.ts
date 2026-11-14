import * as vscode from "vscode";
import { LIBRARY } from "./library";
import { usePattern } from "./regexTool";

// Pick a ready-made pattern and load it into the Regex Playground.
export async function run(): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    LIBRARY.map((p) => ({ label: p.label, description: `/${p.pattern}/${p.flags}`, id: p.id })),
    { placeHolder: "Choose a pattern (engine: JavaScript; check notes for other engines)", matchOnDescription: true }
  );
  if (!pick) return;
  const entry = LIBRARY.find((p) => p.id === pick.id);
  if (entry) await usePattern(entry.pattern, entry.flags);
}

export const tool = { run };
