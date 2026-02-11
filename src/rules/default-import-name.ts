import { camelCase, flatCase, pascalCase, snakeCase } from "scule";
import { createEslintRule } from "../utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { evaluateStringTemplate } from "../string-template-parser";

type ImportPathRegexToTemplateConfig = Record<string, string>;

export const RULE_NAME = "default-import-name";
export type MessageIds = "unmatchedDefaultImportName";
export type Options =
  | [
      {
        ignoredSourceRegexes?: Array<string>;
        importPathRegexToTemplate?: ImportPathRegexToTemplateConfig;
      },
    ]
  | [];

function shouldIgnoreFile({
  sourceImport,
  ignoredSourceRegexes,
}: {
  sourceImport: string;
  ignoredSourceRegexes: Set<string>;
}): boolean {
  return [...ignoredSourceRegexes.values()].some((regex) => {
    try {
      return new RegExp(regex).test(sourceImport);
    } catch (error) {
      console.warn(`Invalid regex pattern: ${regex}`, error);
      return false;
    }
  });
}

export const defaultImportPathToTemplateConfig: ImportPathRegexToTemplateConfig =
  {
    // CSS files with query parameters (e.g., ?url, /url)
    ".*\\.css([?/].*)?$": "styles",
    // Default mapping for files with kebab-case
    ".*/[a-z0-9]+(-[a-z0-9]+)+(.[a-z0-9]+)?$": "${value|camelcase}",
    // Astro files
    ".*.astro": "${value|pascalcase}",
    // React files
    ".*.tsx": "${value|pascalcase}",
    // CSS files
    ".*.css": "styles",
    // SVG files
    ".*.svg": "${value|camelcase}Src",
  };

export const defaultIgnoredSourceRegexes = [
  /**
   * Third party modules that are not path alias
   * NPM packages don't contain "/" (path separators)
   * and don't start with "~" or "\@" which are common path alias
   */
  "^[^@~/][^/]*$",
  // ignore scoped packages
  "^@[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_.]+$",
  // ignore npm packages with subpath exports (e.g. eslint-plugin-expect-type/configs/recommended)
  "^[^@~./][^/]+/.*$",
];

const pipeFunctions = {
  pascalcase: (val: string) => pascalCase(val),
  camelcase: (val: string) => camelCase(val),
  snakecase: (val: string) => snakeCase(val),
  flatcase: (val: string) => flatCase(val),
  uppercase: (val: string) => val.toUpperCase(),
  lowercase: (val: string) => val.toLowerCase(),
} as const;

function transformSnippetText(snippetText: string, value: string): string {
  try {
    return evaluateStringTemplate(snippetText, { value }, pipeFunctions);
  } catch (error) {
    console.warn(`Failed to transform snippet: ${snippetText}`, error);
    return value;
  }
}

function getFileNameWithoutExtension(fileName: string): string {
  return fileName.includes(".")
    ? fileName.split(".").slice(0, -1).join(".")
    : fileName;
}

function getExpectedImportNameWithoutConflicts({
  context,
  actualImportName,
  sourceImport,
  fileName,
  importPathRegexToTemplate,
}: {
  context: RuleContext<MessageIds, Options>;
  actualImportName: string;
  sourceImport: string;
  fileName: string;
  importPathRegexToTemplate: ImportPathRegexToTemplateConfig;
}): string {
  const fileNameWithoutExtension = getFileNameWithoutExtension(fileName);
  let expectedImportName = fileNameWithoutExtension;

  // Apply importPathRegexToTemplate if provided
  for (const [regex, snippet] of Object.entries(
    importPathRegexToTemplate,
  ).toReversed()) {
    try {
      if (new RegExp(regex).test(sourceImport)) {
        const transformedName = transformSnippetText(
          snippet,
          fileNameWithoutExtension,
        );
        expectedImportName = transformedName;
        break;
      }
    } catch (error) {
      console.warn(`Failed to apply regex pattern: ${regex}`, error);
    }
  }

  // Handle naming conflicts
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

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  defaultOptions: [
    {
      importPathRegexToTemplate: defaultImportPathToTemplateConfig,
      ignoredSourceRegexes: defaultIgnoredSourceRegexes,
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
            type: "array",
            items: {
              type: "string",
            },
          },
          importPathRegexToTemplate: {
            description:
              "Object mapping import path regex to import name template based on the file name",
            type: "object",
            additionalProperties: {
              type: "string",
            },
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
    const importPathRegexToTemplate = (context.options[0]
      ?.importPathRegexToTemplate ??
      defaultImportPathToTemplateConfig) as ImportPathRegexToTemplateConfig;

    const configExcludedRegexes =
      (context.options[0]?.ignoredSourceRegexes as Array<string> | undefined) ??
      defaultIgnoredSourceRegexes;

    const ignoredSourceRegexes = new Set(configExcludedRegexes);

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
          importPathRegexToTemplate,
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
