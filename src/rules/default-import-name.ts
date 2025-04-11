import { camelCase, flatCase, kebabCase, pascalCase, snakeCase } from "scule";
import { createEslintRule } from "../utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { evaluateStringTemplate } from "string-template-parser";

export const RULE_NAME = "default-import-name";
export type MessageIds = "unmatchedDefaultImportName";
export type Options =
  | [
      {
        ignoredSourceRegexes?: Array<string>;
        mapFilenamesToImportName?: Record<string, string>;
      },
    ]
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

export const defaultFilenamesToImportNameConfig = {
  // Default mapping for all files
  ".*": "${value}",
  // Default mapping for files with kebab-case
  ".*-.*": "${value|camelcase}",
};

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  defaultOptions: [
    {
      mapFilenamesToImportName: defaultFilenamesToImportNameConfig,
    },
  ],
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
          mapFilenamesToImportName: {
            description:
              "Object mapping fileName regex to import name based on the file name",
            anyOf: [
              {
                type: ["object"],
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
    const mappingConfig = (context.options[0]?.mapFilenamesToImportName ??
      defaultFilenamesToImportNameConfig) as Record<string, string>;

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

        const defaultImport = node.specifiers.find(
          (specifier) =>
            specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier,
        );
        if (defaultImport == null) {
          return;
        }
        const actualImportName = defaultImport.local.name;

        const expectedImportName = getExpectedImportNameWithoutConflicts({
          context,
          actualImportName,
          sourceImport,
          fileName,
          mappingConfig,
        });

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
              const references = sourceCode.ast.tokens.filter((token) => {
                return (
                  (token.type === AST_TOKEN_TYPES.Identifier ||
                    token.type === AST_TOKEN_TYPES.JSXIdentifier) &&
                  token.value === actualImportName
                );
              });

              // Add fixes for all references
              for (const reference of references) {
                fixes.push(
                  fixer.replaceTextRange(reference.range, expectedImportName),
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

function transformSnippetText(snippetText: string, value: string): string {
  const pipeFunctions = {
    pascalcase: (val: string) => pascalCase(val),
    camelcase: (val: string) => camelCase(val),
    kebabcase: (val: string) => kebabCase(val),
    snakecase: (val: string) => snakeCase(val),
    flatcase: (val: string) => flatCase(val),
    uppercase: (val: string) => val.toUpperCase(),
    lowercase: (val: string) => val.toLowerCase(),
  };

  return evaluateStringTemplate(snippetText, { value }, pipeFunctions);
}

function getExpectedImportNameWithoutConflicts({
  context,
  actualImportName,
  sourceImport,
  fileName,
  mappingConfig,
}: {
  context: RuleContext<MessageIds, Options>;
  actualImportName: string;
  sourceImport: string;
  fileName: string;
  mappingConfig: Record<string, string> | null;
}) {
  const fileNameWithoutExtension = fileName.includes(".")
    ? fileName.split(".").slice(0, -1).join(".")
    : fileName;

  let expectedImportName = fileNameWithoutExtension;

  // Apply mappingConfig if provided
  if (mappingConfig != null) {
    for (const [regex, snippet] of Object.entries(mappingConfig).toReversed()) {
      if (new RegExp(regex).test(sourceImport)) {
        try {
          // Transform the snippet text with the file name
          const transformedName = transformSnippetText(
            snippet,
            fileNameWithoutExtension,
          );
          expectedImportName = transformedName;
          break; // Use the first matching pattern
        } catch (error) {
          // If snippet parsing fails, continue with the original name
          console.warn(`Failed to parse snippet for ${fileName}:`, error);
        }
      }
    }
  }

  const existingVariables = new Set(
    context.sourceCode.ast.tokens
      .filter(
        (token) =>
          (token.type === AST_TOKEN_TYPES.Identifier ||
            token.type === AST_TOKEN_TYPES.JSXIdentifier) &&
          token.value !== actualImportName,
      )
      .map((token) => token.value),
  );

  let newImportName = expectedImportName;
  let suffix = 1;
  while (existingVariables.has(newImportName)) {
    newImportName = `${expectedImportName}_${suffix}`;
    suffix++;
  }
  return newImportName;
}
