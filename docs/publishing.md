# Publishing to the Visual Studio Marketplace

This is the checklist for publishing Dev Tool. Publishing is a visible, hard-to-undo step, so it needs an explicit go-ahead.

## One-time setup

1. **Publisher account.** Sign in at https://marketplace.visualstudio.com/manage with a Microsoft account and create a publisher whose ID is exactly `root-shubh`, the value of `publisher` in `package.json`. If you pick a different ID, change `publisher` first.
2. **Personal access token.** In Azure DevOps (https://dev.azure.com), create a token with the scope *Marketplace → Manage*, for all accounts, with an expiry date. Keep it out of the repository.
3. **Log in once** on the command line:
   ```bash
   npx @vscode/vsce login root-shubh
   ```
   Paste the token when asked.

## Each release

1. Make sure `develop` has the release changes, and that CI is green on all three platforms.
2. Check the metadata and changelog:
   ```bash
   npm run check:changelog
   npm test
   npm run lint
   npm run format:check
   ```
3. Build and install the package locally, then test it in VS Code (Dev Tool sidebar, palette, shortcuts, menus, Workbench):
   ```bash
   npm run package
   code --install-extension sv-devtools-<version>.vsix --force
   ```
4. Get approval to publish.
5. Publish:
   ```bash
   npx @vscode/vsce publish --no-dependencies
   ```
   Or publish the tested file: `npx @vscode/vsce publish --packagePath sv-devtools-<version>.vsix`.
6. Tag the release on GitHub (`v<version>`) and attach the `.vsix`.
7. Check the listing at https://marketplace.visualstudio.com/items?itemName=root-shubh.sv-devtools.

## Notes

- A published version cannot be overwritten. To fix a mistake, publish a higher version.
- The Marketplace shows the README, the CHANGELOG, the icon and the gallery banner from the package. The README should be checked on the listing page after publishing.
- Privacy: the listing should link to `PRIVACY.md` (it is in the repository and in the README).
