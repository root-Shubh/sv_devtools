// ESLint flat config for the TypeScript sources and tests.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["out/**", "node_modules/**", "*.vsix"] },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: ["src/**/*.ts"] })),
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      eqeqeq: ["error", "always"]
    }
  },
  {
    files: ["scripts/**/*.js", "eslint.config.mjs"],
    languageOptions: { globals: { require: "readonly", module: "readonly", __dirname: "readonly", console: "readonly", process: "readonly" } }
  }
);
