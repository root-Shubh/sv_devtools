# Changelog

All notable changes to Dev Tool are listed here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- Documentation rewritten: README reorganised, new user guide (every tool, shortcuts, menus, limits), developer guide (architecture, adding a tool, testing, CI, packaging) and contributing guide (branch flow, commits, pull requests, Jira).

## [Unreleased]

### Changed
- Licence changed from MIT to all rights reserved with terms of use. Versions already released under MIT remain MIT for the copies people already have.

## [1.0.0] - 2026-11-14

First public version. Everything below is available from the Dev Tool sidebar, the Command Palette, keyboard shortcuts, the editor right-click menu, the Explorer right-click menu and the Workbench panel.

### Added
- Sidebar with icons per category and tool, counts, favourites and recently used tools, and a welcome message
- Text & Diff: side-by-side diff, quick diff (selection vs clipboard, two selections, two files), text utilities
- Regex playground with live matches, groups, flags, replace preview, copy regex, engine notes and a regex library
- JSON: formatter and validator, comparator, JSON to TypeScript, JSON/CSV, JSONPath, escapes
- Encoding: Base64, URL, HTML entities, Unicode, hex, binary, string escapes, timestamps
- Generators: UUID v4, ULID, hashes (MD5, SHA-1, SHA-256, SHA-512), random strings, passwords, Lorem Ipsum, sample JSON, SQL INSERT
- Developer tools: JWT decoder with optional HMAC signature check (secret never stored), cron helper, Unix permissions, colour converter, SQL formatter, XML, Markdown preview, escape visualiser, HTTP status and MIME references
- Java, C# and Python string literals from the selection
- Workbench panel (Ctrl+Alt+W): input and output side by side, live output, swap, copy, replace selection
- Right-click menus: grouped Dev Tool submenu on selections; file actions in the Explorer (hash, Base64, line/word/character count, JSON validate and format, image to data URI)
- Command Palette commands: show tools view, refresh, clear favourites and recent tools, reload window, show version
- Keyboard shortcuts: Ctrl+Alt+D search, Ctrl+Alt+R regex, Ctrl+Alt+J JSON, Ctrl+Alt+T text diff, Ctrl+Alt+W workbench (Cmd on macOS)

### Changed
- Activation is lazy: tool code loads on first use, so opening VS Code stays fast
- The extension ships as one bundled file (esbuild)
- Documentation rewritten: README, user guide, developer guide, contributing guide, privacy statement

### Fixed
- Empty input gives a clear message in every JSON and SQL tool instead of a raw parser error
- Regex portability warnings now appear for Python and Java
- Regex placeholder and warning text show the correct backslashes
- Clicking a tool opens it instead of showing a placeholder message

### Privacy and security
- No network requests, no telemetry, no account. Only favourites and recent tools are stored, locally.
- File actions only read files, refuse files over 5 MB and refuse binary files.
- JWT signature checks use a secret typed for that one check, which is never saved.

## [0.1.0] - 2026-11-14

First release.

### Added
- Activity Bar container with categorised tool list, search (Ctrl+Alt+D) and favourites / recently used
- Text & Diff: side-by-side diff, swap, clear, summary and copy differences, quick diff (selection vs clipboard, two selections, two files), text utilities
- Regex Playground: live highlighting, groups, flags, replace preview, copy regex, engine notes for Python and Java, regex library
- JSON: formatter and validator, comparator, JSON to TypeScript, JSON/CSV, JSONPath, escape/unescape
- Encoding: Base64, URL encoding, HTML entities, Unicode, hex, binary, string escape, timestamps
- Generators: UUID v4, hashes (MD5, SHA-1, SHA-256, SHA-512), random strings, passwords, Lorem Ipsum, sample JSON, SQL INSERT
- Developer utilities: JWT decoder (signature not verified), cron helper, Unix permissions, colour converter, SQL formatter, XML formatter, Markdown preview, escape visualiser, HTTP status and MIME references
- Editor right-click actions on a selection; output is replaced only on explicit click
