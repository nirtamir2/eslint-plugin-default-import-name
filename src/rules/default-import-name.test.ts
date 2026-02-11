import rule, { RULE_NAME } from "./default-import-name.js";
import { run } from "./_test";
import { any as astro, any as ts, any as tsx } from "code-tag";
import typescriptEslintParser from "@typescript-eslint/parser";
import astroEslintParser from "astro-eslint-parser";

run({
  name: RULE_NAME,
  rule,
  invalid: [
    // Basic file name matching tests
    {
      description: "Should rename import to match .astro file name",
      code: ts`import B from "./A.astro";`,
      output: ts`import A from "./A.astro";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "A.astro",
            expectedImportName: "A",
            actualImportName: "B",
          },
        },
      ],
    },
    {
      description: "Should rename import to match .ts file name",
      code: ts`import B from "./A.ts";`,
      output: ts`import A from "./A.ts";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "A.ts",
            expectedImportName: "A",
            actualImportName: "B",
          },
        },
      ],
    },
    {
      description: "Should rename import to match file name without extension",
      code: ts`import account from "./user";`,
      output: ts`import user from "./user";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user",
            actualImportName: "account",
          },
        },
      ],
    },

    // Default kebab-case to camelCase conversion tests
    {
      description: "Should convert kebab-case file name to camelCase import",
      code: ts`import user from "./get-user.ts";`,
      output: ts`import getUser from "./get-user.ts";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "get-user.ts",
            expectedImportName: "getUser",
            actualImportName: "user",
          },
        },
      ],
    },
    {
      description: "Should convert multiple kebab-case segments to camelCase",
      code: ts`import user from "./get-user-profile.ts";`,
      output: ts`import getUserProfile from "./get-user-profile.ts";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "get-user-profile.ts",
            expectedImportName: "getUserProfile",
            actualImportName: "user",
          },
        },
      ],
    },

    // Custom mapping tests
    {
      description: "Should apply custom mapping for SVG files with Icon suffix",
      code: ts`import logo from "./user-logo.svg";`,
      output: ts`import UserLogoIcon from "./user-logo.svg";`,
      options: [
        {
          importPathRegexToTemplate: {
            "\\.svg$": "${value|pascalcase}Icon",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user-logo.svg",
            expectedImportName: "UserLogoIcon",
            actualImportName: "logo",
          },
        },
      ],
    },
    {
      description:
        "Should apply custom mapping for constants in UPPER_SNAKE_CASE",
      code: ts`import config from "./constants/user-config.ts";`,
      output: ts`import USER_CONFIG from "./constants/user-config.ts";`,
      options: [
        {
          importPathRegexToTemplate: {
            "\\/constants\\/.*\\.ts$": "${value|snakecase|uppercase}",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user-config.ts",
            expectedImportName: "USER_CONFIG",
            actualImportName: "config",
          },
        },
      ],
    },
    {
      description:
        "Should apply custom mapping for React hooks with use prefix",
      code: ts`import user from "./hooks/user.ts";`,
      output: ts`import useUser from "./hooks/user.ts";`,
      options: [
        {
          importPathRegexToTemplate: {
            "\\/hooks\\/.*\\.ts$": "use${value|pascalcase}",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user.ts",
            expectedImportName: "useUser",
            actualImportName: "user",
          },
        },
      ],
    },
    {
      description: "Should apply multiple custom mappings in order",
      code: ts`import user from "./hooks/get-user.ts";`,
      output: ts`import useGetUser from "./hooks/get-user.ts";`,
      options: [
        {
          importPathRegexToTemplate: {
            ".*\\.ts$": "notUse${value|pascalcase}",
            "\\/hooks\\/.*\\.ts$": "use${value|pascalcase}",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "get-user.ts",
            expectedImportName: "useGetUser",
            actualImportName: "user",
          },
        },
      ],
    },

    // Path alias tests
    {
      description: "Should handle path alias imports",
      code: ts`import B from "@/A.ts";`,
      output: ts`import A from "@/A.ts";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "A.ts",
            expectedImportName: "A",
            actualImportName: "B",
          },
        },
      ],
    },

    // Variable usage tests
    {
      description: "Should rename import and all its usages",
      code: ts`
        import account from "./user";
        account.a;
        account.b;
        account();
      `,
      output: ts`
        import user from "./user";
        user.a;
        user.b;
        user();
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user",
            actualImportName: "account",
          },
        },
      ],
    },
    {
      description: "Should handle import name conflicts",
      code: ts`
        import account from "./user";
        const user = {};
        account.a;
      `,
      output: ts`
        import user_1 from "./user";
        const user = {};
        user_1.a;
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user_1",
            actualImportName: "account",
          },
        },
      ],
    },
    {
      description:
        "Should rename import and its usages if we have multiple conflicts",
      code: ts`
        import account from "./user";
        const user = {};
        const user_1 = {};
        account.a;
      `,
      output: ts`
        import user_2 from "./user";
        const user = {};
        const user_1 = {};
        user_2.a;
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user_2",
            actualImportName: "account",
          },
        },
      ],
    },
    {
      description:
        "Should not ignore import names that ends with _1 caused by conflict fix",
      code: ts`
        import user_1 from "./user";
        const user_1 = {};
      `,
      output: ts`
        import user from "./user";
        const user = {};
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user",
            actualImportName: "user_1",
          },
        },
      ],
    },
    {
      description:
        "Should not ignore import names that ends with _2 caused by multiple conflict fix",
      code: ts`
        import user_4 from "./user";
        const user = {};
        const user_1 = {};
        const user_2 = {};
        user_4.a = 1;
      `,
      output: ts`
        import user_3 from "./user";
        const user = {};
        const user_1 = {};
        const user_2 = {};
        user_3.a = 1;
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user_3",
            actualImportName: "user_4",
          },
        },
      ],
    },
    {
      description: "Should handle multiple imports from different locations",
      code: ts`
        import a from "./user";
        import b from "./a/user";
        a.ab = "ab";
        b.acc = 1;
      `,
      output: ts`
        import user from "./user";
        import user_1 from "./a/user";
        user.ab = "ab";
        user_1.acc = 1;
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user",
            actualImportName: "a",
          },
        },
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user",
            expectedImportName: "user",
            actualImportName: "b",
          },
        },
      ],
    },

    // CSS with query parameters tests
    {
      description: "Should enforce 'styles' import for CSS with ?url query",
      code: ts`import myStyles from "./index.css?url";`,
      output: ts`import styles from "./index.css?url";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "index.css?url",
            expectedImportName: "styles",
            actualImportName: "myStyles",
          },
        },
      ],
    },

    // SVG Icon pattern mapping tests
    {
      description: "Should add Icon suffix to SVG imports",
      code: ts`import logo from "./logo.svg";`,
      output: ts`import LogoIcon from "./logo.svg";`,
      options: [
        {
          importPathRegexToTemplate: {
            "\\.svg$": "${value|pascalcase}Icon",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "logo.svg",
            expectedImportName: "LogoIcon",
            actualImportName: "logo",
          },
        },
      ],
    },
    {
      description: "Should handle kebab-case SVG filenames with Icon suffix",
      code: ts`import user from "./user-profile.svg";`,
      output: ts`import UserProfileIcon from "./user-profile.svg";`,
      options: [
        {
          importPathRegexToTemplate: {
            "\\.svg$": "${value|pascalcase}Icon",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user-profile.svg",
            expectedImportName: "UserProfileIcon",
            actualImportName: "user",
          },
        },
      ],
    },
    {
      description: "Should handle multiple SVG imports with Icon suffix",
      code: ts`
        import logo from "./logo.svg";
        import user from "./user-profile.svg";
        import settings from "./settings.svg";
      `,
      output: ts`
        import LogoIcon from "./logo.svg";
        import UserProfileIcon from "./user-profile.svg";
        import SettingsIcon from "./settings.svg";
      `,
      options: [
        {
          importPathRegexToTemplate: {
            "\\.svg$": "${value|pascalcase}Icon",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "logo.svg",
            expectedImportName: "LogoIcon",
            actualImportName: "logo",
          },
        },
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user-profile.svg",
            expectedImportName: "UserProfileIcon",
            actualImportName: "user",
          },
        },
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "settings.svg",
            expectedImportName: "SettingsIcon",
            actualImportName: "settings",
          },
        },
      ],
    },
    {
      description: "Should handle SVG imports with existing Icon suffix",
      code: ts`import logo from "./logo-icon.svg";`,
      output: ts`import LogoIconIcon from "./logo-icon.svg";`,
      options: [
        {
          importPathRegexToTemplate: {
            "\\.svg$": "${value|pascalcase}Icon",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "logo-icon.svg",
            expectedImportName: "LogoIconIcon",
            actualImportName: "logo",
          },
        },
      ],
    },
  ],
  valid: [
    // Basic valid cases
    {
      description: "Should accept correct import name for .astro file",
      code: ts`import A from "./A.astro";`,
    },
    {
      description: "Should accept correct import name for .ts file",
      code: ts`import A from "./A.ts";`,
    },
    {
      description:
        "Should accept correct import name for file without extension",
      code: ts`import user from "./user";`,
    },

    // Kebab-case valid cases
    {
      description: "Should accept camelCase import for kebab-case file name",
      code: ts`import getUser from "./get-user.ts";`,
    },
    {
      description:
        "Should accept camelCase import for kebab-case file name without extension",
      code: ts`import getUser from "./get-user";`,
    },
    {
      description:
        "Should accept camelCase import for multiple kebab-case segments",
      code: ts`import getUserProfile from "./get-user-profile.ts";`,
    },

    // CSS with query parameters
    {
      description: "Should accept 'styles' import for CSS with ?url query",
      code: ts`import styles from "./index.css?url";`,
    },
    {
      description: "Should accept 'styles' import for CSS with /url suffix",
      code: ts`import styles from "../index.css/url";`,
    },
    {
      description: "Should accept 'styles' import for regular CSS files",
      code: ts`import styles from "./index.css";`,
    },

    // Ignored cases
    {
      description: "Should ignore third-party library imports",
      code: ts`import something from "third-party-library";`,
    },
    {
      description: "Should ignore CSS module imports",
      code: ts`import styles from "./a.module.css";`,
    },
    {
      description: "Should ignore scoped package imports",
      code: ts`import A from "@a/b";`,
    },
    {
      description: "Should ignore npm packages ending with .js like fuse.js",
      code: ts`import Fuse from "fuse.js";`,
    },
    {
      description: "Should ignore npm packages with dots like @kurkle/color",
      code: ts`import color from "@kurkle/color";`,
    },
    {
      description: "Should ignore npm packages with subpath exports",
      code: ts`
        import recommended from "eslint-plugin-expect-type/configs/recommended";
      `,
    },
    {
      description: "Should ignore npm packages with deep subpath exports",
      code: ts`import something from "some-package/deep/nested/path";`,
    },
    {
      description: "Should ignore scoped packages with subpath exports",
      code: ts`import config from "@scope/package/config";`,
    },
    {
      description: "Should ignore files matching ignoredSourceRegexes option",
      code: ts`import something from "./ignoredSource.astro";`,
      options: [
        {
          ignoredSourceRegexes: ["ignoredSource.astro$"],
        },
      ],
    },

    // Path alias valid cases
    {
      description: "Should check path alias imports with @ prefix",
      code: ts`import A from "@/A.astro";`,
    },
    {
      description: "Should check path alias imports with ~ prefix",
      code: ts`import A from "~/A.astro";`,
    },
    {
      description: "Should check path alias imports without extension",
      code: ts`import A from "~/A";`,
    },
    {
      description: "Should check @ path alias imports without extension",
      code: ts`import A from "@/A";`,
    },
  ],
});

// JSX specific tests
run({
  name: RULE_NAME,
  rule,
  languageOptions: {
    parser: typescriptEslintParser,
    parserOptions: {
      projectService: true,
      project: "./tsconfig.json",
      tsconfigRootDir: `${import.meta.dirname}/fixtures-jsx`,
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  invalid: [
    {
      description: "Should rename JSX component imports and usages",
      code: tsx`
        import B from "~/A.astro";
        <B />;
        <B a="a" />;
      `,
      output: tsx`
        import A from "~/A.astro";
        <A />;
        <A a="a" />;
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "A.astro",
            expectedImportName: "A",
            actualImportName: "B",
          },
        },
      ],
    },
    {
      description: "Should handle JSX component conflicts",
      code: tsx`
        import B from "~/A.astro";
        import A from "~/another/A.astro";
        <B prop1="value">
          <A>Child</A>
        </B>;
      `,
      output: tsx`
        import A_1 from "~/A.astro";
        import A from "~/another/A.astro";
        <A_1 prop1="value">
          <A>Child</A>
        </A_1>;
      `,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "A.astro",
            expectedImportName: "A_1",
            actualImportName: "B",
          },
        },
      ],
    },
  ],
});

// Configuration tests
run({
  name: RULE_NAME,
  rule,
  valid: [
    {
      description: "Should handle custom ignoredSourceRegexes configuration",
      code: ts`import something from "./custom-ignored.astro";`,
      options: [
        {
          ignoredSourceRegexes: ["custom-ignored.astro$"],
        },
      ],
    },
    {
      description:
        "Should handle custom importPathRegexToTemplate configuration",
      code: ts`import UserService from "./user.ts";`,
      options: [
        {
          importPathRegexToTemplate: {
            ".*\\.ts$": "${value|pascalcase}Service",
          },
        },
      ],
    },
    {
      description: "Should handle multiple custom configurations",
      code: ts`
        import UserService from "./user.ts";
        import something from "./custom-ignored.astro";
      `,
      options: [
        {
          importPathRegexToTemplate: {
            ".*\\.ts$": "${value|pascalcase}Service",
          },
          ignoredSourceRegexes: ["custom-ignored.astro$"],
        },
      ],
    },
  ],
  invalid: [
    {
      description:
        "Should apply custom importPathRegexToTemplate configuration",
      code: ts`import user from "./user.ts";`,
      output: ts`import UserService from "./user.ts";`,
      options: [
        {
          importPathRegexToTemplate: {
            ".*\\.ts$": "${value|pascalcase}Service",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "user.ts",
            expectedImportName: "UserService",
            actualImportName: "user",
          },
        },
      ],
    },
  ],
});

run({
  name: RULE_NAME,
  rule,
  languageOptions: {
    parser: astroEslintParser,
  },
  invalid: [
    {
      description: "Astro",
      code: astro`---
import Blog from "../../layouts/ArticleLayout.astro";
---

<Blog>
  test
</Blog>
`,
      output: astro`---
import ArticleLayout from "../../layouts/ArticleLayout.astro";
---

<ArticleLayout>
  test
</ArticleLayout>
`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "ArticleLayout.astro",
            expectedImportName: "ArticleLayout",
            actualImportName: "Blog",
          },
        },
      ],
    },
  ],
});
