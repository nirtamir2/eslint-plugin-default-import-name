import { createRule } from "../createRule.js";
import type { BaseModuleSpecifier, ImportDefaultSpecifier } from "estree";
import camelCase from "camelcase";

function isImportDefaultSpecifier(
  specifier: BaseModuleSpecifier,
): specifier is ImportDefaultSpecifier {
  return specifier.type === "ImportDefaultSpecifier";
}

function isFileExtensionIgnored({
  fileName,
  ignoreFileExtensions,
}: {
  fileName: string;
  ignoreFileExtensions: Set<string>;
}) {
  const fileOrFileExtension = fileName.split(".").at(-1);
  return (
    fileOrFileExtension != null && ignoreFileExtensions.has(fileOrFileExtension)
  );
}

function shouldIgnoreFile({
  sourceImport,
  pathAliasSymbols,
  ignoreFileExtensions,
}: {
  sourceImport: string;
  pathAliasSymbols: Set<string>;
  ignoreFileExtensions: Set<string>;
}) {
  if (!sourceImport.includes(".")) {
    const isContainPathAliasSymbol = [...pathAliasSymbols.values()].some(
      (pathAliasSymbol) => sourceImport.startsWith(pathAliasSymbol),
    );

    if (!isContainPathAliasSymbol) {
      return true;
    }
  }

  const fileName = sourceImport.split("/").pop();
  if (fileName == null) {
    return true;
  }

  return isFileExtensionIgnored({
    fileName,
    ignoreFileExtensions,
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
    const configDefaultImportNames =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (context.options[0]?.pathAliasSymbols as Array<string> | undefined) ?? [];

    const pathAliasSymbols = new Set(["@", "~", ...configDefaultImportNames]);

    const configIgnoreFileExtensions =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (context.options[0]?.ignoredFileExtensions as
        | Array<string>
        | undefined) ?? [];

    const ignoreFileExtensions = new Set([
      "css",
      ...configIgnoreFileExtensions,
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
            pathAliasSymbols,
            ignoreFileExtensions,
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
