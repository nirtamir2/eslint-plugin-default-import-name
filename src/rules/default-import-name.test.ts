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
      description:
        "Should rename import to match simple file name without extension",
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

    // Usage reference tests
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
      skip: true,
      description: "Should rename import and its usages in type annotations",
      code: ts`
        import account from "./user";
        type User = account.User;
        const user: account.User = {};
      `,
      output: ts`
        import user from "./user";
        type User = user.User;
        const userObj: user.User = {};
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
  ],
});
