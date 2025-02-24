import type { ESLint } from "eslint";
import { name, version } from "../package.json";
import defaultImportName from "./rules/default-import-name";

export const plugin = {
  meta: {
    name,
    version,
  },
  // @keep-sorted
  rules: {
    "default-import-name": defaultImportName,
  },
} satisfies ESLint.Plugin;
