# Dev Tool

A lightweight developer toolbox for VS Code. Everyday utilities (diff, regex, JSON, encoding, generators and developer references) are a click or a keystroke away, without leaving the editor.

- **Fast:** tools load when you use them. Activation only registers the sidebar and commands.
- **Local:** everything runs on your machine. No network requests, telemetry or accounts.
- **Native:** uses VS Code's diff editor, quick picks, input boxes, theme colours and Markdown preview.
- **Safe:** output opens in a new document. Your source changes only when you click **Replace source**.

## Documentation

| Document | For |
|---|---|
| [User guide](docs/user-guide.md) | Using every tool, shortcuts and menus |
| [Developer guide](docs/developer-guide.md) | Architecture, adding a tool, testing, CI and packaging |
| [Contributing](docs/contributing.md) | Branches, commits, pull requests and Jira |
| [Changelog](CHANGELOG.md) | Release notes |

## Quick start

1. Open the **Dev Tool** icon in the Activity Bar (left edge).
2. Pick a category, or press **Ctrl+Alt+D** (Cmd+Alt+D on macOS) to search.
3. Select text and right-click for quick actions, or run a tool and paste your input.

Shortcuts: **Ctrl+Alt+R** Regex Playground, **Ctrl+Alt+J** JSON, **Ctrl+Alt+T** Text Diff.

## Tools at a glance

| Category | Tools |
|---|---|
| Text & Diff | Text diff, quick diff, text utilities |
| Regex | Regex playground, regex library |
| JSON & Data | Formatter and validator, comparator, JSON to TypeScript, JSON utilities |
| Encoding & Conversion | Base64, URL encoding, encoding and conversion, timestamps |
| Generators | UUID v4, hashes, generators (random strings, passwords, Lorem Ipsum, sample JSON, SQL INSERT) |
| Developer Utilities | JWT decoder, developer utilities (cron, permissions, colours, SQL), references (XML, Markdown preview, escape visualiser, HTTP status, MIME types) |

See the [user guide](docs/user-guide.md) for what each tool does.

## Install

Build the package and install it:

```bash
npm install
npm run package          # creates sv-devtools-<version>.vsix
```

Then in VS Code run **Extensions: Install from VSIX...** and pick the file, or from a terminal:

```bash
code --install-extension sv-devtools-1.0.0.vsix
```

The extension is not published to the Visual Studio Marketplace yet.

## Privacy

Dev Tool works entirely on your machine. It makes no network requests, collects no telemetry and needs no account. It stores only your favourites and recently used tools. Read the full statement in [PRIVACY.md](PRIVACY.md).

## Notes and limits

- **JWT:** decoding shows the header and payload only. The signature is **not** verified, so do not trust claims on their own.
- **Regex:** matching always uses the JavaScript engine. Python and Java notes are warnings about known differences, not a different matcher.
- **SQL formatter:** a layout helper for simple statements, not a full SQL parser.
- **Diff ignore options:** whitespace and case options apply to the summary and copy actions. The diff view itself follows VS Code's own diff settings.
- **Large input:** the diff tool refuses more than 5,000 lines per side. The regex tool shows the first 1,000 matches.

## Development

```bash
npm install
npm run compile
npm test
```

See the [developer guide](docs/developer-guide.md) for the project layout and how to add a tool.

## License

All rights reserved. See [LICENSE](LICENSE) for the terms of use.
