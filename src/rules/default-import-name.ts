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
  ignoredSourceRegexes,
}: {
  sourceImport: string;
  ignoredSourceRegexes: Set<string>;
}) {
  return [...ignoredSourceRegexes.values()].some((regex) => {
    return new RegExp(regex).test(sourceImport);
  });
}

export default createRule({
  meta: {
    type: "problem",
    docs: {
      url: "https://github.com/nirtamir2/eslint-plugin-default-import-name#readme",
      description: "enforce default imports matching file names",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          ignoredSourceRegexes: {
            description: "List of regexes to ignore import sources",
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
        "Inconsistent naming in '{{fileName}}'. The default import '{{actualImportName}}' does not match the expected '{{expectedImportName}}",
    },
  },

  create(context) {
    const configExcludedRegexes =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (context.options[0]?.ignoredSourceRegexes as Array<string> | undefined) ??
      [];

    const ignoredSourceRegexes = new Set([
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
            ignoredSourceRegexes,
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

        const expectedImportName = fileNameWithoutExtension.includes("-")
          ? camelCase(fileNameWithoutExtension)
          : fileNameWithoutExtension;

        const defaultImport = node.specifiers.find((specifier) =>
          isImportDefaultSpecifier(specifier),
        );
        if (defaultImport == null || !isImportDefaultSpecifier(defaultImport)) {
          return;
        }
        const actualImportName = defaultImport.local.name;
        if (actualImportName !== expectedImportName) {
          context.report({
            node,
            messageId: "unmatchedDefaultImportName",
            data: {
              fileName,
              actualImportName,
              expectedImportName,
            },
            fix(fixer) {
              return fixer.replaceText(defaultImport, expectedImportName);
            },
          });
        }
      },
    };
  },
});
