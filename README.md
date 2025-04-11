# eslint-plugin-default-import-name

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

Enforce default imports matching file names
This makes default export more structured.

![default-import-name-demo.gif](docs%2Fdefault-import-name-demo.gif)

[Rules List](./src/rules)

## Configuration

```shell
pnpm add -D eslint-plugin-default-import-name
```

Add to your `eslint.config.js`

```js
import defaultImportNameConfig from "eslint-plugin-default-import-name/config";

export default [defaultImportNameConfig()];
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
