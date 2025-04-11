import nirtamir2 from "@nirtamir2/eslint-config";

export default nirtamir2(
  {
    type: "lib",
  },
  [
    {
      ignores: ["vendor"],
    },
    {
      // This is a port of https://github.com/souldreamer/string-template-parser that does not support ESM
      // @see https://github.com/souldreamer/string-template-parser/issues/2
      ignores: ["src/string-template-parser"],
    },
    {
      rules: {
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-empty-test-file": "off",
        "no-template-curly-in-string": "off",

        "sonarjs/unused-import": "off",
        "import-x/no-duplicates": "off",
      },
    },
  ],
).removeRules(["unicorn/no-empty-file"]);
// replace local config
// .onResolved((configs) => {
//   configs.forEach((config) => {
//     if (config?.plugins?.antfu) config.plugins.antfu = local;
//   });
// });
