import rule, { RULE_NAME } from "./default-import-name.js";
import { run } from "./_test";
import { any as ts, any as tsx } from "code-tag";
import typescriptEslintParser from "@typescript-eslint/parser";

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

    // Kebab-case to camelCase conversion tests
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

    // Path alias tests
    {
      description: "Should handle path alias imports with @ prefix",
      code: ts`import B from "@/A.astro";`,
      output: ts`import A from "@/A.astro";`,
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
      description: "Should handle path alias imports with ~ prefix",
      code: ts`import B from "~/A.astro";`,
      output: ts`import A from "~/A.astro";`,
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
      description: "Should handle path alias imports without extension",
      code: ts`import B from "~/A";`,
      output: ts`import A from "~/A";`,
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "A",
            expectedImportName: "A",
            actualImportName: "B",
          },
        },
      ],
    },

    // Variable usage tests
    {
      description: "Should rename import and all its usages in the code",
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
      description:
        "Should rename import and its usages in object destructuring",
      code: ts`
        import account from "./user";
        const { a, b } = account;
        const c = account.c;
      `,
      output: ts`
        import user from "./user";
        const { a, b } = user;
        const c = user.c;
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
      description: "Should rename import and its usages if we have conflict",
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

    // SVG Icon pattern mapping tests
    {
      description: "Should add Icon suffix to SVG imports",
      code: ts`import logo from "./logo.svg";`,
      output: ts`import LogoIcon from "./logo.svg";`,
      options: [
        {
          mapFilenamesToImportName: {
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
          mapFilenamesToImportName: {
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
          mapFilenamesToImportName: {
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
          mapFilenamesToImportName: {
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

    // String template parser format tests
    {
      description:
        "Should transform import name using string template parser with pascalcase",
      code: ts`import user from "./get-user.ts";`,
      output: ts`import GetUser from "./get-user.ts";`,
      options: [
        {
          mapFilenamesToImportName: {
            "get-.*\\.ts$": "${value|pascalcase}",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "get-user.ts",
            expectedImportName: "GetUser",
            actualImportName: "user",
          },
        },
      ],
    },
    {
      description:
        "Should transform import name using string template parser with uppercase",
      code: ts`import user from "./get-user.ts";`,
      output: ts`import GET_USER from "./get-user.ts";`,
      options: [
        {
          mapFilenamesToImportName: {
            "get-.*\\.ts$": "${value|snakecase|uppercase}",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "get-user.ts",
            expectedImportName: "GET_USER",
            actualImportName: "user",
          },
        },
      ],
    },
    {
      description:
        "Should transform import name using string template parser with multiple pipes",
      code: ts`import myConfig from "./constants/my-config.ts";`,
      output: ts`import MY_CONFIG from "./constants/my-config.ts";`,
      options: [
        {
          mapFilenamesToImportName: {
            "\\/constants\\/.*\\.ts$": "${value|snakecase|uppercase}",
          },
        },
      ],
      errors: [
        {
          messageId: "unmatchedDefaultImportName",
          data: {
            fileName: "my-config.ts",
            expectedImportName: "MY_CONFIG",
            actualImportName: "myConfig",
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
      description: "Should rename JSX component with props and children",
      code: tsx`
        import B from "~/A.astro";
        <B prop1="value">
          <div>Child</div>
        </B>;
      `,
      output: tsx`
        import A from "~/A.astro";
        <A prop1="value">
          <div>Child</div>
        </A>;
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
