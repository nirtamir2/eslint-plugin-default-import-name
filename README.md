# eslint-plugin-default-import-name

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

An ESLint plugin that enforces consistent and predictable naming conventions for default imports based on their source file names. This helps maintain a clean and standardized codebase by automatically ensuring that imported names follow a logical pattern.

## Features

- 🔧 **Automatic Fixing**: Automatically fixes import names to match the expected convention
- 📦 **Smart File Type Handling**: Different naming conventions for different file types (e.g., PascalCase for React components, camelCase for utilities)
- 🛡️ **Conflict Resolution**: Automatically handles naming conflicts by appending numbers
- ⚙️ **Configurable**: Customize naming patterns for different file paths using regex patterns
- 🚫 **Ignorable Paths**: Configure paths to ignore (e.g., third-party modules)

## Default Conventions

The plugin automatically applies these conventions:

- React components (`.tsx`): PascalCase
- Astro components (`.astro`): PascalCase
- CSS files: `styles`
- SVG files: camelCase with `Src` suffix
- Other files: camelCase

```json
{
  "importPathRegexToTemplate": {
    // Kebab-case files to camelCase
    ".*/[a-z0-9]+(-[a-z0-9]+)+(.[a-z0-9]+)?$": "${value|camelcase}",
    // Astro files to PascalCase
    ".*.astro": "${value|pascalcase}",
    // React files to PascalCase
    ".*.tsx": "${value|pascalcase}",
    // CSS files to 'styles'
    ".*.css": "styles",
    // SVG files to camelCase with Src suffix
    ".*.svg": "${value|camelcase}Src"
  },
  "ignoredSourceRegexes": [
    // Third party modules that are not path alias
    "^(?![@~])[^.]*$",
    // Scoped packages
    "^@[a-zA-Z0-9-_]+/[a-zA-Z0-9-_.]+$"
  ]
}
```

## Installation

```shell
pnpm add -D eslint-plugin-default-import-name
```

## Configuration

Add to your `eslint.config.js`:

```js
import defaultImportNameConfig from "eslint-plugin-default-import-name/config";

export default [defaultImportNameConfig()];
```

### Custom Configuration

You can customize the naming conventions and ignored paths using the ESLint rule configuration:

```js
import defaultImportName from "eslint-plugin-default-import-name/plugin";

export default [
  {
    plugins: {
      "default-import-name": defaultImportName,
    },
    rules: {
      "default-import-name/default-import-name": [
        "warn",
        {
          // Ignore specific import paths
          ignoredSourceRegexes: ["^@my-scope/.*$"],
          // Custom naming patterns
          importPathRegexToTemplate: {
            ".*/components/.*": "${value|pascalcase}",
            ".*/utils/.*": "${value|camelcase}",
          },
        },
      ],
    },
  },
];
```

## Supported Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                    | Description                                 | 🔧  |
| :------------------------------------------------------ | :------------------------------------------ | :-- |
| [default-import-name](src/rules/default-import-name.md) | enforce default imports matching file names | 🔧  |

<!-- end auto-generated rules list -->

## License

[MIT](./LICENSE) License © 2024-PRESENT [Nir Tamir](https://github.com/nirtamir2)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-default-import-name?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-default-import-name
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-default-import-name?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-default-import-name
