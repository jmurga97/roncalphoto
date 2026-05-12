import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginLit from "eslint-plugin-lit";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginWc from "eslint-plugin-wc";
import globals from "globals";
import tseslint from "typescript-eslint";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const sharedParserOptions = {
  projectService: true,
  tsconfigRootDir: rootDir,
};

const appFiles = ["apps/*/src/**/*.{ts,tsx}"];
const packageFiles = ["packages/*/src/**/*.{ts,tsx}", "packages/*/tests/**/*.{ts,tsx}"];
const typeScriptFiles = [...appFiles, ...packageFiles];

const reactAppFiles = ["apps/photos/src/**/*.{ts,tsx}", "apps/photos-admin/src/**/*.{ts,tsx}"];
const reactPackageFiles = [
  "packages/email-templates/src/**/*.{ts,tsx}",
  "packages/ui/src/**/*.{ts,tsx}",
  "packages/ui/tests/**/*.{ts,tsx}",
];
const reactFiles = [...reactAppFiles, ...reactPackageFiles];

const workerFiles = [
  "apps/api/src/**/*.ts",
  "apps/email-worker/src/**/*.ts",
  "apps/image-optimizer/src/**/*.ts",
];
const litFiles = ["packages/murga-components/src/**/*.{ts,tsx}"];

const workerEntrypointRestrictedImportPattern = {
  group: ["../*", "../../*", "../../../*"],
  message: "Usa alias internos en entrypoints de app/config/módulo.",
};

const tsconfigPaths = [
  "apps/photos/tsconfig.json",
  "apps/photos-admin/tsconfig.json",
  "apps/api/tsconfig.json",
  "apps/email-worker/tsconfig.json",
  "apps/image-optimizer/tsconfig.json",
  "packages/auth/tsconfig.json",
  "packages/email-templates/tsconfig.json",
  "packages/murga-components/tsconfig.json",
  "packages/shared/tsconfig.json",
  "packages/ui/tsconfig.json",
].map((projectPath) => path.join(rootDir, projectPath));

const importSettings = {
  ...importPlugin.flatConfigs.typescript.settings,
  "import/resolver": {
    typescript: {
      alwaysTryTypes: true,
      caseSensitive: false,
      noWarnOnMultipleProjects: true,
      project: tsconfigPaths,
    },
    node: {
      extensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".d.ts"],
    },
  },
};

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: typeScriptFiles,
}));

const mergeFlatRules = (configs) =>
  Object.assign({}, ...configs.map((config) => config.rules ?? {}));

const sharedTypeScriptRules = {
  eqeqeq: ["error", "always"],
  "max-depth": ["warn", 4],
  "max-lines-per-function": [
    "warn",
    {
      max: 80,
      skipBlankLines: true,
      skipComments: true,
    },
  ],
  "max-params": ["warn", 6],
  "no-console": ["warn", { allow: ["error", "log"] }],
  "no-unused-vars": "off",
  "no-warning-comments": [
    "warn",
    {
      location: "anywhere",
      terms: ["fix", "fixme", "todo", "xxx"],
    },
  ],
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      args: "all",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      ignoreRestSiblings: true,
      varsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      prefer: "type-imports",
      fixStyle: "separate-type-imports",
    },
  ],
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
  "import/newline-after-import": "error",
  "import/no-duplicates": "error",
  "import/order": [
    "warn",
    {
      groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],
  "import/no-unresolved": [
    "error",
    {
      caseSensitive: false,
      ignore: ["\\.css$", "\\.svg$", "\\.png$", "\\.jpg$", "\\.webp$", "\\?.*$"],
    },
  ],
};

const reactRules = {
  ...pluginReact.configs.flat.recommended.rules,
  ...pluginReact.configs.flat["jsx-runtime"].rules,
  ...jsxA11y.configs.recommended.rules,
  ...mergeFlatRules(pluginQuery.configs["flat/recommended"]),
  "max-lines-per-function": [
    "warn",
    {
      max: 260,
      skipBlankLines: true,
      skipComments: true,
    },
  ],
  "react/jsx-no-constructed-context-values": "error",
  "react/prop-types": "off",
  "react-hooks/exhaustive-deps": "warn",
  "react-hooks/rules-of-hooks": "error",
};

export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/.wrangler/**",
      "**/node_modules/**",
      "**/worker-configuration.d.ts",
      "**/*.config.js",
      "**/*.config.ts",
      "apps/*/src/app/route-tree.gen.ts",
      "apps/*/src/app/routeTree.gen.ts",
      "apps/api/src/db/migrations/**",
      "apps/api/scripts/**",
      "scripts/**",
      "docs/**",
      "apidef/**",
      "gen/**",
      "bun.lock",
    ],
  },
  {
    files: typeScriptFiles,
    ...js.configs.recommended,
  },
  ...typeCheckedConfigs,
  {
    files: typeScriptFiles,
    languageOptions: {
      parserOptions: sharedParserOptions,
      sourceType: "module",
    },
    plugins: {
      import: importPlugin,
    },
    rules: sharedTypeScriptRules,
    settings: importSettings,
  },
  {
    files: reactFiles,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
      parserOptions: sharedParserOptions,
    },
    plugins: {
      react: pluginReact,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "@tanstack/query": pluginQuery,
    },
    rules: reactRules,
    settings: {
      ...importSettings,
      react: {
        version: "detect",
      },
    },
  },
  {
    files: reactAppFiles,
    plugins: {
      "react-refresh": reactRefresh,
      "@tanstack/router": pluginRouter,
    },
    rules: {
      ...mergeFlatRules(pluginRouter.configs["flat/recommended"]),
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["Route"] },
      ],
    },
  },
  {
    files: [
      "apps/photos/src/app/routes/**/*.{ts,tsx}",
      "apps/photos-admin/src/app/routes/**/*.{ts,tsx}",
      "apps/photos/src/utils/render-rich-text.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: [
      "apps/photos/src/**/*.ts",
      "apps/photos/src/**/*.tsx",
      "apps/photos-admin/src/**/*.ts",
      "apps/photos-admin/src/**/*.tsx",
    ],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: rootDir,
          zones: [
            {
              target: "./apps/photos/src/lib",
              from: [
                "./apps/photos/src/app",
                "./apps/photos/src/components",
                "./apps/photos/src/pages",
              ],
              message: "La capa lib no debe depender de app, components ni pages.",
            },
            {
              target: "./apps/photos/src/utils",
              from: [
                "./apps/photos/src/app",
                "./apps/photos/src/components",
                "./apps/photos/src/lib",
                "./apps/photos/src/pages",
              ],
              message: "La capa utils debe permanecer independiente de UI y lib.",
            },
            {
              target: "./apps/photos/src/components",
              from: "./apps/photos/src/pages",
              message: "Los componentes compartidos no deben depender de pages.",
            },
            {
              target: "./apps/photos-admin/src/lib",
              from: [
                "./apps/photos-admin/src/app",
                "./apps/photos-admin/src/components",
                "./apps/photos-admin/src/pages",
              ],
              message: "La capa lib no debe depender de app, components ni pages.",
            },
            {
              target: "./apps/photos-admin/src/utils",
              from: [
                "./apps/photos-admin/src/app",
                "./apps/photos-admin/src/components",
                "./apps/photos-admin/src/lib",
                "./apps/photos-admin/src/pages",
              ],
              message: "La capa utils debe permanecer independiente de UI y lib.",
            },
            {
              target: "./apps/photos-admin/src/components",
              from: "./apps/photos-admin/src/pages",
              message: "Los componentes compartidos no deben depender de pages.",
            },
          ],
        },
      ],
    },
  },
  {
    files: workerFiles,
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.worker,
      },
      parserOptions: sharedParserOptions,
    },
    settings: importSettings,
  },
  {
    files: litFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: sharedParserOptions,
    },
    plugins: {
      lit: pluginLit,
      wc: pluginWc,
    },
    rules: {
      ...pluginLit.configs["flat/recommended"].rules,
      ...pluginWc.configs["flat/recommended"].rules,
    },
    settings: importSettings,
  },

  {
    files: ["packages/shared/src/**/*.{ts,tsx}"],
    rules: {
      "import/no-cycle": "error",
    },
  },
  {
    files: [
      "apps/api/src/app/**/*.ts",
      "apps/email-worker/src/app/**/*.ts",
      "apps/image-optimizer/src/app/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            workerEntrypointRestrictedImportPattern,
            {
              regex: "^@/modules/[^/]+/(?!routes$).+",
              message: "La capa app debe importar solo entrypoints de módulos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "apps/api/src/config/**/*.ts",
      "apps/email-worker/src/config/**/*.ts",
      "apps/image-optimizer/src/config/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            workerEntrypointRestrictedImportPattern,
            {
              regex: "^@/app(?:/.*)?$",
              message: "La capa config no debe depender de la capa app.",
            },
            {
              regex: "^@/modules/[^/]+/routes(?:$|/.*)",
              message: "La capa config no debe depender de rutas HTTP.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "apps/api/src/shared/**/*.ts",
      "apps/email-worker/src/shared/**/*.ts",
      "apps/image-optimizer/src/shared/**/*.ts",
    ],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: rootDir,
          zones: [
            {
              target: "./apps/api/src/shared",
              from: [
                "./apps/api/src/app/**/*",
                "./apps/api/src/modules/*/routes.ts",
                "./apps/api/src/modules/*/routes/**/*",
              ],
              message: "Shared no debe depender de app ni de rutas HTTP.",
            },
            {
              target: "./apps/email-worker/src/shared",
              from: [
                "./apps/email-worker/src/app/**/*",
                "./apps/email-worker/src/modules/*/routes.ts",
                "./apps/email-worker/src/modules/*/routes/**/*",
              ],
              message: "Shared no debe depender de app ni de rutas HTTP.",
            },
            {
              target: "./apps/image-optimizer/src/shared",
              from: [
                "./apps/image-optimizer/src/app/**/*",
                "./apps/image-optimizer/src/modules/*/routes.ts",
                "./apps/image-optimizer/src/modules/*/routes/**/*",
              ],
              message: "Shared no debe depender de app ni de rutas HTTP.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/api/src/modules/**/*.ts"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: rootDir,
          zones: [
            {
              target: "./apps/api/src/modules/photos",
              from: ["./apps/api/src/modules/sessions", "./apps/api/src/modules/tags"],
              message: "Cada módulo de API debe mantenerse aislado del resto.",
            },
            {
              target: "./apps/api/src/modules/sessions",
              from: ["./apps/api/src/modules/photos", "./apps/api/src/modules/tags"],
              message: "Cada módulo de API debe mantenerse aislado del resto.",
            },
            {
              target: "./apps/api/src/modules/tags",
              from: ["./apps/api/src/modules/photos", "./apps/api/src/modules/sessions"],
              message: "Cada módulo de API debe mantenerse aislado del resto.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/api/src/modules/*/routes.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            workerEntrypointRestrictedImportPattern,
            {
              regex: "^@/db(?:/.*)?$",
              message: "Las rutas de API no deben acceder a DB directamente.",
            },
            {
              regex: "^@/modules/[^/]+/repositories(?:$|/.*)",
              message: "Las rutas de API deben pasar por services, no por repositories.",
            },
            {
              regex: "^@/modules/[^/]+/utils(?:$|/.*)",
              message: "Las rutas de API no deben depender de utils internos de módulo.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/api/src/modules/*/routes/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/db(?:/.*)?$",
              message: "Las rutas de API no deben acceder a DB directamente.",
            },
            {
              regex: "^@/modules/[^/]+/repositories(?:$|/.*)",
              message: "Las rutas de API deben pasar por services, no por repositories.",
            },
            {
              regex: "^@/modules/[^/]+/utils(?:$|/.*)",
              message: "Las rutas de API no deben depender de utils internos de módulo.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/api/src/modules/*/services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/app(?:/.*)?$",
              message: "Services no deben depender de app.",
            },
            {
              regex: "^@/modules/[^/]+/routes(?:$|/.*)",
              message: "Services no deben depender de rutas.",
            },
            {
              regex: "^@/modules/[^/]+/schemas(?:$|/.*)",
              message: "Services no deben depender de schemas HTTP.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/api/src/modules/*/repositories/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/app(?:/.*)?$",
              message: "Repositories no deben depender de app.",
            },
            {
              regex: "^@/config(?:/.*)?$",
              message: "Repositories no deben depender de config.",
            },
            {
              regex: "^@/modules/[^/]+/(routes|schemas|services|utils)(?:$|/.*)",
              message: "Repositories deben permanecer en la capa de persistencia.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/email-worker/src/modules/*/routes.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            workerEntrypointRestrictedImportPattern,
            {
              regex: "^@/config(?:/.*)?$",
              message: "Las rutas del worker no deben depender directamente de config.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/email-worker/src/modules/*/routes/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/config(?:/.*)?$",
              message: "Las rutas del worker no deben depender directamente de config.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/image-optimizer/src/modules/*/routes.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [workerEntrypointRestrictedImportPattern],
        },
      ],
    },
  },
  {
    files: ["apps/email-worker/src/modules/*/services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/app(?:/.*)?$",
              message: "Services del worker no deben depender de app.",
            },
            {
              regex: "^@/modules/[^/]+/routes(?:$|/.*)",
              message: "Services del worker no deben depender de rutas.",
            },
            {
              regex: "^@/modules/[^/]+/schemas(?:$|/.*)",
              message: "Services del worker no deben depender de schemas HTTP.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/image-optimizer/src/modules/images/**/*.ts"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: rootDir,
          zones: [
            {
              target: "./apps/image-optimizer/src/modules/images",
              from: "./apps/image-optimizer/src/modules/uploads",
              message: "El módulo images no debe depender del módulo uploads.",
            },
          ],
        },
      ],
    },
  },
);
