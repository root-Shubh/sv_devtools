# Privacy

Dev Tool is built to keep your data on your computer.

## What the extension does with your data

- **Processes text and files locally.** Every tool runs inside VS Code on your machine. Input text, selections and files are never sent over the network.
- **Makes no network requests.** The extension does not call any server, API, CDN or update service of its own. It cannot fetch remote content.
- **Collects no telemetry.** It sends no usage data, crash reports or identifiers anywhere.
- **Needs no account or API key.** Nothing to sign in to.
- **Stores only two things, on your machine:** the tools you have marked as favourites, and the last few tools you opened. VS Code keeps these in its global storage. You can clear them with *Dev Tool: Clear Favourites and Recently Used*.
- **Does not keep secrets.** The JWT signature check uses a secret you type for that one check. It is never saved, logged or sent anywhere.
- **Reads files only when you ask.** File actions read the file you right-click. They never write to it. Files over 5 MB and binary files are refused.

## What is not covered

- VS Code itself, and its extensions, have their own privacy terms. Dev Tool does not change them.
- If you paste data into a tool, that data is still in your clipboard, editor history and any screenshots you take. Clear those as you normally would.

## Changes

Any change that would collect or send data will be announced in the changelog, and this file will be updated first.

## Contact

Questions about privacy: open an issue at https://github.com/root-Shubh/sv_devtools/issues
