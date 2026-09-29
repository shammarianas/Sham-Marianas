import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "functions/**",
      "public/assets/js/**",
      "src/**/*.backup",
    ],
  },
  {
    files: ["src/**/*.{js,jsx}", "*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "react/jsx-no-target-blank": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react-hooks/component-hook-factories": "warn",
      "react-hooks/config": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/gating": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },
];
