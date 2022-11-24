import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

export type vitePluginRequireUrlParam = {
  //filter files that should enter the plugin
  fileRegex?: RegExp;
};
export default function vitePluginRequireUrl(
  params: vitePluginRequireUrlParam = {}
) {
  const { fileRegex = /.ts$|.tsx$/ } = params;

  return {
    name: "vite-plugin-require-url",
    async transform(code: string, id: string) {
      let newCode = code;
      let inputMap = null;
      if (fileRegex.test(id)) {
        const ast = parser.parse(code, {
          sourceType: "module",
          sourceFilename: id,
        });
        traverse(ast, {
          Identifier(path) {
            // require(`./xxx`) => new URL(`./xxx`, import.meta.url).href
            const parentNode = path?.parentPath?.node;
            if (
              path.isIdentifier({ name: "require" }) &&
              t.isCallExpression(parentNode)
            ) {
              const templateLiteralNode = parentNode.arguments.find((arg) =>
                t.isTemplateLiteral(arg)
              );
              if (templateLiteralNode) {
                const newUrlNode = t.newExpression(t.identifier("URL"), [
                  templateLiteralNode,
                  t.memberExpression(
                    t.metaProperty(
                      t.identifier("import"),
                      t.identifier("meta")
                    ),
                    t.identifier("url"),
                    false
                  ),
                ]);
                const newNode = t.memberExpression(
                  newUrlNode,
                  t.identifier("href")
                );
                path.parentPath.replaceWith(newNode);

                const warpPath = path.parentPath.parentPath;
                // require("./xxx").default =>
                // new URL(`./xxx`, import.meta.url).href.default =>
                // new URL(`./xxx`, import.meta.url).href
                if (
                  warpPath &&
                  t.isMemberExpression(warpPath) &&
                  t.isIdentifier(path?.parentPath?.parentPath?.node?.property)
                ) {
                  const warpNode = path?.parentPath?.parentPath?.node;
                  path.parentPath.parentPath.replaceWith(warpNode.object);
                }
              }
            }
          },
        });
        const output = generate(
          ast,
          { sourceMaps: true, sourceFileName: id },
          code
        );

        newCode = output.code;
        inputMap = output.map
      }
      return {
        code: newCode,
        map: inputMap, // TODO:
      };
    },
  };
}
