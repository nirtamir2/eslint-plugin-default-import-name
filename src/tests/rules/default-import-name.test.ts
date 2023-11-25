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
  ],
  valid: [`import A from "./A.astro";`],
});
