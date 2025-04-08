import { camelCase } from "scule";
import { createEslintRule } from "../utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";

export const RULE_NAME = "default-import-name";
export type MessageIds = "unmatchedDefaultImportName";
export type Options =
  | [{ ignoredSourceRegexes: Array<string> | undefined }]
  | [];

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

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      url: "https://github.com/nirtamir2/eslint-plugin-default-import-name#readme",
      description: "enforce default imports matching file names",
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
      // ignore scoped packages
      "^@[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_.]+$",
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

        const defaultImport = node.specifiers.find(
          (specifier) =>
            specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier,
        );
        if (defaultImport == null) {
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
              const fixes = [];

              const { sourceCode } = context;

              // Find all references to this import
              const references = sourceCode.ast.tokens
                .filter((token) => {
                  return (
                    (token.type === AST_TOKEN_TYPES.Identifier ||
                      token.type === AST_TOKEN_TYPES.JSXIdentifier) &&
                    token.value === actualImportName
                  );
                })
                .map((token) => {
                  return {
                    range: [token.range[0], token.range[1]] as const,
                    text: expectedImportName,
                  };
                });

              // Add fixes for all references
              for (const reference of references) {
                fixes.push(
                  fixer.replaceTextRange(reference.range, reference.text),
                );
              }

              return fixes;
            },
          });
        }
      },
    };
  },
});
