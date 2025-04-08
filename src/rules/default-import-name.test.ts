import rule, { RULE_NAME } from "./default-import-name.js";
import { run } from "./_test";
import { any as ts, any as tsx } from "code-tag";
import typescriptEslintParser from "@typescript-eslint/parser";

run({
  name: RULE_NAME,
  rule,
  invalid: [
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
      description: "Should rename import to match simple file name",
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
    {
      description: "Should handle @ path alias imports without extension",
      code: ts`import B from "@/A";`,
      output: ts`import A from "@/A";`,
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
  ],
  valid: [
    {
      description: "Should accept correct import name for .astro file",
      code: ts`import A from "./A.astro";`,
    },
    {
      description: "Should accept camelCase import for kebab-case file name",
      code: ts`import getUser from "./get-user.ts";`,
    },
    {
      description: "Should accept camelCase import for kebab-case file name without extension",
      code: ts`import getUser from "./get-user";`,
    },
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
    {
      description: "Should ignore files matching ignoredSourceRegexes option",
      code: ts`import something from "./ignoredSource.astro";`,
      options: [
        {
          ignoredSourceRegexes: ["ignoredSource.astro$"],
        },
      ],
    },
  ],
});

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
  ],
});
