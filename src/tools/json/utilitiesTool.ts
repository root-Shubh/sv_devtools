import * as vscode from "vscode";
import { runTransform, pickAction } from "../../ui/transform";
import { jsonToCsv, csvToJson, jsonPath, escapeJsonString, unescapeJsonString } from "./utilities";

export async function run(): Promise<void> {
  await pickAction("JSON utilities", [
    { label: "JSON to CSV", run: () => runTransform("JSON to CSV", jsonToCsv, "csv") },
    { label: "CSV to JSON", run: () => runTransform("CSV to JSON", csvToJson, "json") },
    {
      label: "JSONPath extract",
      run: async () => {
        const path = await vscode.window.showInputBox({ prompt: "JSONPath, e.g. $.users[*].name" });
        if (!path) return;
        await runTransform("JSONPath", (x) => jsonPath(x, path), "json");
      }
    },
    {
      label: "Escape as JSON string",
      run: () => runTransform("Escape", (x) => ({ ok: true, text: escapeJsonString(x) }))
    },
    { label: "Unescape JSON string", run: () => runTransform("Unescape", unescapeJsonString) }
  ]);
}

export const tool = { run };
