/* eslint-disable sonarjs/no-duplicate-string */
import rule from "../../rules/default-import-name";
import { ruleTester } from "./ruleTester";

ruleTester.run("default-import-name", rule, {
  invalid: [
    {
      code: `import B from "./A.astro";`,
      output: `import A from "./A.astro";`,
      errors: [
        {
          message: "Unmatched default import name 'B' for file 'A.astro'.",
        },
      ],
    },
    {
      code: `import user from "./get-user.ts";`,
      output: `import getUser from "./get-user.ts";`,
      errors: [
        {
          message:
            "Unmatched default import name 'user' for file 'get-user.ts'.",
        },
      ],
    },
    {
      code: `import account from "./user";`,
      output: `import user from "./user";`,
      errors: [
        {
          message: "Unmatched default import name 'account' for file 'user'.",
        },
      ],
    },
    {
      code: `import B from "@/A.astro";`,
      output: `import A from "@/A.astro";`,
      errors: [
        {
          message: "Unmatched default import name 'B' for file 'A.astro'.",
        },
      ],
    },
    {
      code: `import B from "~/A.astro";`,
      output: `import A from "~/A.astro";`,
      errors: [
        {
          message: "Unmatched default import name 'B' for file 'A.astro'.",
        },
      ],
    },
  ],
  valid: [
    `import A from "./A.astro";`,
    // Should convert files with - to camelCase
    `import getUser from "./get-user.ts";`,
    `import getUser from "./get-user";`,
    `import something from "third-party-library";`,
    `import A from "@/A.astro";`,
  ],
});

/* eslint-enable sonarjs/no-duplicate-string */
