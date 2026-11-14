# User guide

This guide describes every Dev Tool feature. For installation and development see the [README](../README.md) and the [developer guide](developer-guide.md).

## Finding tools

- **Sidebar:** click the **Dev Tool** icon in the Activity Bar. The **Tools** view lists six categories.
- **Search:** click the search icon in the Tools view title, or press **Ctrl+Alt+D** (Cmd+Alt+D on macOS). Type words from a tool's name, purpose or category.
- **Favourites:** hover a tool and click the star to pin it. Favourites appear at the top of the view.
- **Recently used:** the last five tools you opened appear under **Recently Used**.
- **Command palette:** every feature is also a command starting with *Dev Tool:*.

### Keyboard shortcuts

| Action | Windows / Linux | macOS |
|---|---|---|
| Search tools | Ctrl+Alt+D | Cmd+Alt+D |
| Regex Playground | Ctrl+Alt+R | Cmd+Alt+R |
| JSON Formatter | Ctrl+Alt+J | Cmd+Alt+J |
| Text Diff | Ctrl+Alt+T | Cmd+Alt+T |

### Right-click actions

Select text in any editor and right-click. The **Dev Tool** section offers:

- Base64 Encode Selection and Base64 Decode Selection
- Format JSON Selection
- Remove Duplicate Lines
- SHA-256 Selection
- Compare Selection with Clipboard
- Open Selection in Regex Playground

## How output works

Most tools work the same way:

1. They read your **selection**, or the **whole document** if nothing is selected.
2. They show the result in a **new document** beside your editor.
3. If you started from a selection or document, a notification offers **Replace source**. Your text changes only if you click it.

Results that are also useful as text are copied to the clipboard (generators, UUIDs).

## Text & Diff

### Text Diff

Opens two empty editors side by side in VS Code's diff view. Paste or type into either side.

- **Diff summary** (command palette): counts added, removed and unchanged lines. You can choose *ignore whitespace* and/or *ignore case* first.
- **Copy Differences**: copies only the changed lines, prefixed with `+` (added) and `-` (removed).
- **Swap Diff Sides** and **Clear Diff Inputs**: swap the two sides or empty both.

Limits: more than 5,000 lines per side is refused with a message. The diff view itself follows VS Code's own whitespace settings; the ignore options apply to the summary and copy actions.

### Quick Diff

Three modes, chosen from a quick pick:

- **Selection vs Clipboard:** compares the selected text with what is on your clipboard.
- **Two Selections:** select the first block, run the command, select the second block, run it again.
- **Two Files:** pick two files; they open in the diff view.

The two selection modes also open a unified diff (like `diff -u`) with three lines of context around each change. The two-file mode opens the native diff only.

### Text Utilities

Pick an action from the list. Each one works on the selection or the document:

- Remove duplicate lines (optionally ignoring case)
- Sort lines A–Z or Z–A
- Reverse lines, trim whitespace on each line, remove empty lines
- Convert line endings to LF or CRLF
- Find and replace: literal text, regular expressions with `$1` groups, or ignore case
- Count characters (Unicode-aware), words and lines

## Regex

### Regex Playground

Run **Regex Playground** (or Ctrl+Alt+R). You will be asked for:

1. **Pattern**, without slashes, for example `\d{3}-\d{4}`.
2. **Flags:** `i` (ignore case), `m` (multiline), `s` (dot matches newlines), `u` (Unicode). The `g` flag is always on.
3. **Engine:** JavaScript is used for matching. Python and Java show warnings about known differences.

Matches are highlighted in a test document. Edit that document and the highlights update. A notification shows the match count and the groups of the first match. Matches are capped at 1,000.

Other regex commands:

- **Regex Replace Preview:** enter a replacement such as `$2 $1` or `$<name>`. The result opens in a new document; your text is not changed.
- **Copy Regex:** copies the pattern as `/pattern/flags`.

### Regex Library

Choose a ready-made pattern: email, phone number, HTTP(S) URL, IPv4 address, ISO date, UUID, integer, decimal, alphanumeric, whitespace, HTML tag, strong password, hex colour. The pattern loads into the playground. Each pattern is tested against valid and invalid examples. Check the engine notes before using a pattern outside JavaScript.

## JSON & Data

### JSON Formatter

Run **JSON Format / Minify / Validate** (or Ctrl+Alt+J) and pick an action:

- **Format:** pretty-prints with two-space indentation.
- **Minify:** removes all whitespace.
- **Validate:** reports *Valid JSON*, or the line and column of the first syntax error.

### JSON to TypeScript

Turns a JSON sample into TypeScript interfaces:

- Nested objects become their own named interfaces.
- `null` becomes `T | null`.
- A key missing from some array items becomes optional (`key?`).
- Arrays of mixed types become unions.
- Keys that are not valid identifiers are quoted.

The root type is named `Root`.

### JSON Utilities

- **JSON to CSV:** the input must be an array of objects. Headers are the union of all keys. Values containing commas, quotes or line breaks are quoted.
- **CSV to JSON:** the first row is the header. Quoted fields may contain commas and newlines. Values stay as text.
- **JSONPath extract:** supports `$`, `.key`, `["quoted key"]`, `[0]` and `[*]`. One match prints as a value; several print as an array.
- **Escape / Unescape JSON string:** converts text to and from a JSON string literal.

### JSON Comparator

Available from the tool list. Paste the two documents in the input boxes and choose a mode:

- **Ignore key order** (default): `{"a":1,"b":2}` equals `{"b":2,"a":1}`.
- **Key order matters**: reports a change when the key order differs.

The result lists each change with its path, for example `+ $.user.roles[1]`, `- $.id`, or `~ $.name: "a" -> "b"`.

## Encoding & Conversion

- **Base64:** encode or decode UTF-8 text. Accepts URL-safe characters and line breaks. Empty input stays empty.
- **URL:** encode a query value (`component`), encode a whole URL (`full`), or decode. Decoding can treat `+` as a space, as form data does.
- **Encoding and conversion:** HTML entities (encode/decode), Unicode escapes (`\uXXXX`, `\u{...}`), text to and from hex, text to and from binary (8-bit groups), string escape and unescape.
- **Timestamps:** Unix time to date (seconds and milliseconds are detected by size), date to Unix seconds and milliseconds, and the current time. Results show ISO UTC, readable UTC and your local zone.

## Generators

- **UUID v4:** 1 to 100 UUIDs, lowercase or uppercase, with or without dashes. Copied to the clipboard.
- **Hashes:** MD5, SHA-1, SHA-256 or SHA-512 of the selection, or all four at once. Output is hex over UTF-8 text.
- **Generators** (one menu):
  - *Random string*: length and character set (letters and digits, letters, digits, or hex).
  - *Password*: length and character types. At least one character of each chosen type is guaranteed.
  - *Lorem Ipsum*: a number of words.
  - *Sample JSON*: field spec such as `id:int, name:string, active:bool, created:date`. Types: `int`, `float`, `string`, `bool`, `date`, `uuid`.
  - *SQL INSERT from JSON*: uses the selected JSON array (or asks for one) and a table name. Strings are quoted and escaped, `null` becomes `NULL`, booleans become `TRUE`/`FALSE`.

## Developer Utilities

### JWT Decoder

Decodes a token from the selection or an input box. The output shows notes, header, payload, time claims in UTC, and the raw signature.

> **The signature is not verified.** Anyone can create a token with any claims. Use this tool to read tokens, not to decide whether they are valid.

Notes flag expired tokens, tokens not yet valid, and tokens with `alg: none`.

To check the signature, choose *Verify with a secret (HMAC)* and type the secret. It works for HS256, HS384 and HS512 only. The secret is used for that one check and is not saved. RSA and ECDSA tokens need their public key, which this tool does not support.

### Developer Utilities (menu)

- **Cron helper:** enter a 5-field expression. Shows a plain-English summary and the next five run times in local time. Supports `*`, lists, ranges and steps. Day-of-month and day-of-week combine with OR when both are set, as in standard cron.
- **Unix permissions:** enter an octal mode (`755`) to get the symbolic form, or a symbolic mode (`rwxr-xr-x`) to get the octal form.
- **Colour converter:** HEX (3 or 6 digits) to RGB and HSL.
- **SQL formatter:** puts clauses (`SELECT`, `FROM`, `WHERE`, joins and others) on their own lines and upper-cases keywords. Works on simple statements. It is not a full SQL parser.

### References (menu)

- **XML: format and validate:** indents well-formed XML and reports mismatched or unclosed tags.
- **Markdown preview:** opens the selection or document in VS Code's Markdown preview.
- **Escape visualiser:** shows each character with its code point and escaped form.
- **HTTP status codes** and **MIME types:** reference lists with short descriptions.

## Settings and data

Dev Tool stores only your favourites and recently used tools, in VS Code's global state on your machine. It has no settings to configure.

## Troubleshooting

- **Nothing happens when I click a tool:** open **View → Output** and choose *Dev Tool* or *Extension Host* in the list. Errors appear there.
- **A shortcut does nothing:** check that another extension does not use the same key (Keyboard Shortcuts editor, search for the key).
- **Markdown preview is missing:** Dev Tool uses VS Code's built-in Markdown extension. Check that it is enabled.
