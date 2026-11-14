import * as vscode from "vscode";
import * as d from "./utilities";
import { runTransform, pickAction } from "../../ui/transform";

async function show(lines: string[]): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({ content: lines.join("\n"), language: "plaintext" });
  await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

async function cron(): Promise<void> {
  const expr = await vscode.window.showInputBox({ prompt: "Cron expression (5 fields)", value: "0 9 * * 1-5" });
  if (!expr) return;
  const runs = d.nextRuns(expr, new Date(), 5);
  if (!runs.ok) return void vscode.window.showErrorMessage(runs.message);
  await show([
    `Expression: ${expr}`,
    `Meaning: ${d.describeCron(expr)}`,
    "Next runs (local time):",
    ...runs.runs.map((r) => `  ${r.toString()}`)
  ]);
}

async function permissions(): Promise<void> {
  const input = await vscode.window.showInputBox({ prompt: "Octal (755) or symbolic (rwxr-xr-x)" });
  if (!input) return;
  const octal = d.permsFromOctal(input.trim());
  if (octal.ok) return void (await show([`Octal: ${input.trim()}`, `Symbolic: ${octal.symbolic}`]));
  const sym = d.permsFromSymbolic(input.trim());
  if (sym.ok) return void (await show([`Symbolic: ${input.trim()}`, `Octal: ${sym.octal}`]));
  void vscode.window.showErrorMessage("Enter an octal mode like 755 or a symbolic mode like rwxr-xr-x.");
}

async function colour(): Promise<void> {
  const input = await vscode.window.showInputBox({ prompt: "Colour as HEX, e.g. #1A2B3C" });
  if (!input) return;
  const rgb = d.hexToRgb(input);
  if (!rgb) return void vscode.window.showErrorMessage("Enter a 3 or 6 digit hex colour.");
  const hsl = d.rgbToHsl(rgb.r, rgb.g, rgb.b);
  await show([
    `HEX: ${d.rgbToHex(rgb.r, rgb.g, rgb.b)}`,
    `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  ]);
}

export async function run(): Promise<void> {
  await pickAction("Developer utilities", [
    { label: "Cron helper", run: cron },
    { label: "Unix permissions", run: permissions },
    { label: "Colour converter (HEX to RGB/HSL)", run: colour },
    { label: "SQL formatter", run: () => runTransform("SQL format", (x) => ({ ok: true, text: d.formatSql(x) }), "sql") }
  ]);
}

export const tool = { run };
