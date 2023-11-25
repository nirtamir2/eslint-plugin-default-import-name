import { createRule } from "../createRule.js";
import type { BaseModuleSpecifier, ImportDefaultSpecifier } from "estree";
import camelCase from "camelcase";

function isImportDefaultSpecifier(
  specifier: BaseModuleSpecifier,
): specifier is ImportDefaultSpecifier {
  return specifier.type === "ImportDefaultSpecifier";
}

function shouldIgnoreFile({
  sourceImport,
  ignoredRegexes,
}: {
  sourceImport: string;
  ignoredRegexes: Set<string>;
}) {
  return [...ignoredRegexes.values()].some((regex) => {
    return new RegExp(regex).test(sourceImport);
  });
}

export default createRule({
  meta: {
    type: "problem",
    docs: {
      url: "https://github.com/nirtamir2/eslint-plugin-default-import-name#readme",
      description: 'enforce use of "clsx" with dynamic data argument',
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          pathAliasSymbols: {
            anyOf: [
              {
                type: ["array"],
                items: {
                  type: ["string"],
                },
              },
            ],
          },
        },
      },
    ],
    messages: {
      unmatchedDefaultImportName:
        "Unmatched default import name '{{ defaultImportName }}' for file '{{ fileName }}'.",
    },
  },

  create(context) {
    const configExcludedRegexes =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (context.options[0]?.ignoredRegexes as Array<string> | undefined) ?? [];

    const ignoredRegexes = new Set([
      // ignored file extensions
      ".css$",
      /**
       * Third party modules that are not path alias
       * File that does not include "."
       * and not start with "~" or "\@" which are common path alias
       */
      "^(?![@~])[^.]*$",
      ...configExcludedRegexes,
    ]);

    return {
      ImportDeclaration(node) {
        const sourceImport = node.source.value;
        if (typeof sourceImport !== "string") {
          return;
        }

        if (
          shouldIgnoreFile({
            sourceImport,
            ignoredRegexes,
          })
        ) {
          return;
        }

        const fileName = sourceImport.split("/").pop();
        if (fileName == null) {
          return;
        }

        const fileNameWithoutExtension = fileName.includes(".")
          ? fileName.split(".").slice(0, -1).join(".")
          : fileName;

        const requiredImportName = fileNameWithoutExtension.includes("-")
          ? camelCase(fileNameWithoutExtension)
          : fileNameWithoutExtension;

        const defaultImport = node.specifiers.find((specifier) =>
          isImportDefaultSpecifier(specifier),
        );
        if (defaultImport == null || !isImportDefaultSpecifier(defaultImport)) {
          return;
        }
        const defaultImportName = defaultImport.local.name;
        if (defaultImportName !== requiredImportName) {
          context.report({
            node,
            messageId: "unmatchedDefaultImportName",
            data: {
              defaultImportName,
              fileName,
            },
            fix(fixer) {
              return fixer.replaceText(defaultImport, requiredImportName);
            },
          });
        }
      },
    };
  },
});
