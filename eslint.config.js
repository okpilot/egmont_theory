import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Flat config does NOT read .gitignore — ignore build output & generated dirs.
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".astro/",
      "public/",
      "**/*.config.{js,mjs,ts}",
    ],
  },

  // TypeScript / TSX source (non type-aware — fast, no tsconfig project needed).
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Astro components.
  ...astro.configs.recommended,
);
