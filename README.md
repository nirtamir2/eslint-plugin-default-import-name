# eslint-plugin-default-import-name

ESLint rule: enforce default imports matching file names
This makes default export more structured.  
![default-import-name-demo.gif](docs%2Fdefault-import-name-demo.gif)

## Installation

You'll first need to install [ESLint](http://eslint.org) >=8 and `eslint-plugin-default-import-name`:

```shell
pnpm add -D eslint eslint-plugin-default-import-name
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-default-import-name` globally.

## Usage

Add an override to your ESLint configuration file that specifies this plugin, [`eslint-plugin-default-import-name`](https://github.com/nirtamir2/eslint-plugin-default-import-name) and its recommended rules for your `package.json` file:

```js
module.exports = {
  extends: ["plugin:eslint-plugin-default-import-name/recommended"],
};
```

Or, individually configure the rules you want to use under the rules section.

```js
module.exports = {
    {
      plugins: ["default-import-name"],
      rules: {
        "default-import-name/default-import-name": "error",
      },
  ],
};
```

## Supported Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                     | Description                                 | 🔧  |
| :------------------------------------------------------- | :------------------------------------------ | :-- |
| [default-import-name](docs/rules/default-import-name.md) | enforce default imports matching file names | 🔧  |

<!-- end auto-generated rules list -->
