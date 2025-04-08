import rule, { RULE_NAME } from "./default-import-name.js";
import { run } from "./_test";
import { any as ts, any as tsx } from "code-tag";
import typescriptEslintParser from "@typescript-eslint/parser";

run({
  name: RULE_NAME,
  rule,
  invalid: [
    {
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
      description: "Fix multiple references",
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
    ts`import A from "./A.astro";`,
    // Should convert files with - to camelCase
    ts`import getUser from "./get-user.ts";`,
    ts`import getUser from "./get-user";`,
    // Should ignore 3rd party libraries
    ts`import something from "third-party-library";`,
    // Should ignore css files
    ts`import styles from "./a.module.css";`,
    // Should ignore scoped package
    ts`import A from "@a/b";`,
    // Should still check path alias files
    ts`import A from "@/A.astro";`,
    ts`import A from "~/A.astro";`,
    ts`import A from "~/A";`,
    ts`import A from "@/A";`,
    {
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
      description: "jsx support",
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
