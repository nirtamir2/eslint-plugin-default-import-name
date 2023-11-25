import rule from "../../rules/default-import-name.js";
import { ruleTester } from "./ruleTester.js";

ruleTester.run("default-import-name", rule, {
  invalid: [
    {
      code: `import B from "./A.astro";`,
      output: `import A from "./A.astro";`,
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
      code: `import user from "./get-user.ts";`,
      output: `import getUser from "./get-user.ts";`,
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
      code: `import account from "./user";`,
      output: `import user from "./user";`,
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
      code: `import B from "@/A.astro";`,
      output: `import A from "@/A.astro";`,
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
      code: `import B from "~/A.astro";`,
      output: `import A from "~/A.astro";`,
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
      code: `import B from "~/A";`,
      output: `import A from "~/A";`,
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
      code: `import B from "@/A";`,
      output: `import A from "@/A";`,
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
    `import A from "./A.astro";`,
    // Should convert files with - to camelCase
    `import getUser from "./get-user.ts";`,
    `import getUser from "./get-user";`,
    // Should ignore 3rd party libraries
    `import something from "third-party-library";`,
    // Should ignore css files
    `import styles from "./a.module.css";`,
    // Should still check path alias files
    `import A from "@/A.astro";`,
    `import A from "~/A.astro";`,
    `import A from "~/A";`,
    `import A from "@/A";`,
  ],
});
