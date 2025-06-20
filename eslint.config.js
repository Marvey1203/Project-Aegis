
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["packages/aegis-dashboard/*", "packages/eira-dev-agent/dist/*", "packages/aegis-core/dist/*"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": [
        "error",
        {
          "types": { "object": false },
          "extendDefaults": true
        }
      ]
    }
  }
);
