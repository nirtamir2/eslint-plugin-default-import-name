import { createRule } from "../createRule";
import type { BaseModuleSpecifier, ImportDefaultSpecifier } from "estree";

function isImportDefaultSpecifier(
  specifier: BaseModuleSpecifier,
): specifier is ImportDefaultSpecifier {
  return specifier.type === "ImportDefaultSpecifier";
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
          addiotionalDefaultImportNames: {
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
    // const configDefaultImportNames =
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //   (context.options[0]?.addiotionalDefaultImportNames as
    //     | Array<string>
    //     | undefined) ?? [];
    //
    // const defaultImportNames = new Set([...configDefaultImportNames]);

    return {
      ImportDeclaration(node) {
        const sourceImport = node.source.value;
        if (typeof sourceImport !== "string") {
          return;
        }
        const fileName = sourceImport.split("/").pop();
        if (fileName == null) {
          return;
        }
        // Correct name
        const fileNameWithoutExtension = fileName.includes(".")
          ? fileName.split(".").slice(0, -1).join(".")
          : fileName;

        const defaultImport = node.specifiers.find((specifier) =>
          isImportDefaultSpecifier(specifier),
        );
        if (defaultImport == null || !isImportDefaultSpecifier(defaultImport)) {
          return;
        }
        const defaultImportName = defaultImport.local.name;
        if (defaultImportName !== fileNameWithoutExtension) {
          context.report({
            node,
            messageId: "unmatchedDefaultImportName",
            data: {
              defaultImportName,
              fileName,
            },
            fix(fixer) {
              return fixer.replaceText(defaultImport, fileNameWithoutExtension);
            },
          });
        }
      },
    };
  },
});
