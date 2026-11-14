# Developer guide

This guide covers how Dev Tool is organised, how to add a tool, how to test and package it, and how CI works.

## Requirements

- Node.js 20 or newer (CI uses 20; local development on Node 26 also works)
- npm
- VS Code 1.85 or newer, to run the extension

## Quick commands

```bash
npm install          # install dev dependencies (exact lockfile versions)
npm run compile      # TypeScript build into out/
npm test             # run the unit tests with node:test (out/test/*.test.js)
npm run package      # build sv-devtools-<version>.vsix with vsce (pinned 3.9.1)
```

The repository has no `.vscode/launch.json`, so there is no F5 debug setup yet. To try a change in VS Code, package the VSIX and install it (see Packaging). Adding an Extension Development Host configuration is a reasonable follow-up.

## Project layout

```
src/
  extension.ts            activation: registers tools, commands, shortcuts and the tree view
  views/
    toolTree.ts           the Tools view (categories, favourites, recently used)
    searchTools.ts        search quick pick
  state/
    toolState.ts          favourites and recent tools (globalState)
  tools/
    registry.ts           the list of tools shown in the tree (id, label, category)
    loader.ts             lazy loader: a tool module loads on first use, once
    text/                 diff, quick diff, text utilities (pure logic + *Tool.ts UI)
    regex/                playground, library, regex UI
    json/                 format, compare, to-TypeScript, utilities, UI
    encoding/             base64, url, conversion, timestamps, UI
    generators/           uuid, hash, generators, UI
    developer/            jwt, utilities (cron, permissions, colour, SQL), references, UI
  ui/
    transform.ts          shared flow: selection in, new document out, Replace on request
    contextActions.ts     right-click actions (tool modules imported on use)
  test/                   unit tests and guard tests (see Testing)
media/                    icon.svg (Activity Bar) and icon.png (Marketplace)
docs/                     user, developer and contributing guides
.github/workflows/ci.yml  CI on Ubuntu, Windows and macOS
```

## Architecture rules

1. **Pure logic has no VS Code imports.** Put algorithms in files such as `src/tools/text/diff.ts`. They take strings and return results. This keeps them fast to test with `node:test`.
2. **UI lives in `*Tool.ts`.** Each tool module exports `tool = { run }`. `run()` reads the editor or asks for input, calls the pure logic, and shows the result.
3. **Output is never written to the source by default.** Use the `runTransform` helper in `src/ui/transform.ts`. It opens a new document and offers *Replace source* only when the user clicks it.
4. **Lazy loading.** `extension.ts` registers each tool with `registerTool(id, () => import(...))`. Nothing else at activation may import tool code. A guard test checks this.
5. **No network, no telemetry, no secrets.** Tools must work offline.
6. **Theme-aware UI.** Use `ThemeColor` and `ThemeIcon`. Never hard-code colours in UI code. A guard test checks this.
7. **Errors are results, not exceptions.** Pure functions return `{ ok: true, ... }` or `{ ok: false, message }`. Only the UI layer shows messages.

## Adding a tool

Example: adding a tool called `slug` in the Text & Diff category.

1. **Pure logic:** create `src/tools/text/slug.ts`, exporting functions that take strings and return a result type.
2. **Tests:** create `src/test/slug.test.ts`. Cover valid input, invalid input, empty input, Unicode and round trips where they apply.
3. **UI:** create `src/tools/text/slugTool.ts`:
   ```ts
   import { runTransform } from "../../ui/transform";
   import { slugify } from "./slug";
   export async function run(): Promise<void> {
     await runTransform("Slugify", (x) => ({ ok: true, text: slugify(x) }));
   }
   export const tool = { run };
   ```
4. **Registry:** add an entry to `TOOLS` in `src/tools/registry.ts`, with a unique `id`, `label`, `category` and `description`.
5. **Loader:** in `src/extension.ts`, add `registerTool("slug", async () => (await import("./tools/text/slugTool")).tool);`.
6. **Command (optional):** add a command to `contributes.commands` in `package.json` if the tool should appear in the palette, and register its handler in `extension.ts`.
7. **Shortcut (optional):** add an entry to `contributes.keybindings` with `command: "devtool.openTool"` and `args: "slug"`.
8. **Docs:** add a section to `docs/user-guide.md`, and a line to the CHANGELOG under *Unreleased*.

The wiring tests fail if a registry tool has no loader, a command has no title or handler, or a keybinding points to an unknown command. Run `npm test` to check.

## Testing

Tests use Node's built-in runner (`node --test`). They run against the compiled output in `out/test/`.

| File | What it covers |
|---|---|
| `*.test.ts` (per tool) | Valid and invalid input, empty input, Unicode, edge cases |
| `roundtrip.test.ts` | Randomised round trips (200 rounds each): Base64, URL, HTML, Unicode escapes, hex, binary, JSON, CSV, diff; deep JSON; large diff timing |
| `wiring.test.ts` | Registry, loaders, command titles and handlers, keybindings |
| `activation.test.ts` | Entry point does not import tools at activation |
| `theme.test.ts` | No hard-coded colours in UI code |
| `keybindings.test.ts` | Keybindings point to declared commands; no duplicates |

Known gap: VS Code UI (tree, quick picks, diff view, decorations, context menu) is not covered by automated tests. It must be checked by hand in a VS Code window.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes to the branch flow (`develop`, `qa`, `staging`, `release`, `master`) and on every pull request. It runs `npm ci`, `npm run compile` and `npm test` on `ubuntu-latest`, `windows-latest` and `macos-latest`.

## Packaging

```bash
npm run package
```

This writes `sv-devtools-<version>.vsix` to the project root. `.vscodeignore` excludes source, tests, CI config and source maps; the package contains `out/` (compiled JavaScript), `media/`, `README.md`, `CHANGELOG.md`, `LICENSE` and `package.json`.

Before a release:

1. Bump `version` in `package.json` following [Semantic Versioning](https://semver.org/).
2. Move the *Unreleased* CHANGELOG entries under the new version and date.
3. Run `npm test` and `npm run package`.
4. Install the VSIX and check the Activity Bar, search, one tool per category, and a right-click action.
5. Publishing to the Marketplace is a separate step and needs approval.

## Versioning

- MAJOR: incompatible changes to commands, shortcuts or stored favourites.
- MINOR: new tools or features.
- PATCH: fixes only.
