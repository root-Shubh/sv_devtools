// Fails when CHANGELOG.md has no heading for the version in package.json.
// Run with: npm run check:changelog
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");

const heading = `## [${pkg.version}]`;
if (!changelog.includes(heading)) {
  console.error(`CHANGELOG.md has no entry for version ${pkg.version}. Add a "${heading} - YYYY-MM-DD" section.`);
  process.exit(1);
}
console.log(`CHANGELOG.md has an entry for ${pkg.version}.`);
