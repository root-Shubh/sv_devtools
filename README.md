# Dev Tool

A lightweight developer toolbox for VS Code. Common utilities are a click or a keystroke away, without leaving the editor.

- **Fast:** tools load when you open them. Activation only registers the sidebar and commands.
- **Local:** everything runs on your machine. No network requests, telemetry or account.
- **Native:** uses VS Code's diff editor, quick picks, input boxes, theme colours and Markdown preview.

## Tools

| Category | Tools |
|---|---|
| Text & Diff | Text diff, quick diff, text utilities (dedupe, sort, trim, find/replace, line endings, counts) |
| Regex | Regex playground with live matches and replace preview, regex library |
| JSON & Data | Formatter and validator, comparator, JSON to TypeScript, JSON/CSV, JSONPath, escape |
| Encoding & Conversion | Base64, URL, HTML entities, Unicode, hex, binary, string escape, timestamps |
| Generators | UUID v4, hashes, random strings, passwords, Lorem Ipsum, sample JSON, SQL INSERT |
| Developer Utilities | JWT decoder, cron helper, Unix permissions, colour converter, SQL formatter, XML, Markdown preview, escape visualiser, HTTP status and MIME references |

## Using it

- Open the **Dev Tool** icon in the Activity Bar.
- Search with **Ctrl+Alt+D** (Cmd+Alt+D on macOS).
- Shortcuts: **Ctrl+Alt+R** regex playground, **Ctrl+Alt+J** JSON, **Ctrl+Alt+T** text diff.
- Select text and right-click for Base64, JSON formatting, hashes, dedupe, clipboard compare and regex.

Output opens in a new document. Your source is changed only when you click **Replace source**.

## Notes

- **JWT:** decoding shows the header and payload only. It does not verify the signature, so do not trust claims on their own.
- **Regex:** matching uses the JavaScript engine. Python and Java may behave differently, and the playground warns about known differences.
- **SQL formatter:** a simple layout tool, not a full SQL parser.

## Development

```bash
npm install
npm run compile
npm test
```

Build a package with `npm run package`, which creates a `.vsix` file you can install with *Extensions: Install from VSIX*.

## License

MIT. See [LICENSE](LICENSE).
