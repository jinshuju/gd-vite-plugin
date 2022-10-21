import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'

import type { PluginOption } from 'vite'

const defaultLabel = '@gd-vite-ignore'

function getComments(node) {
  return (node && node.leadingComments) || []
}

function hasRemoveNextPrefix(comments, label = defaultLabel) {
  return comments.some(c => c.value.trim().indexOf(label) === 0)
}

function getImportName(node) {
  const specifiers = node.specifiers
  const firstDefaultSpec = specifiers.find(specifier => t.isImportDefaultSpecifier(specifier))
  if (firstDefaultSpec && t.isIdentifier(firstDefaultSpec?.local)) {
    return firstDefaultSpec.local.name
  }
}

function getVariableName(node) {
  const declarations = node.declarations
  const firstVariable = declarations.find(declaration => t.isVariableDeclarator(declaration))
  if (firstVariable && t.isIdentifier(firstVariable?.id)) {
    return firstVariable.id.name
  }
}

export type vitePluginIgnoreType = {
  fileRegex?: RegExp
  label?: string
}
export default function vitePluginIgnore(params: vitePluginIgnoreType = {}): PluginOption {
  const { fileRegex = /.tsx$/ } = params

  return {
    name: 'vite-plugin-ignore',
    enforce: 'pre',
    async transform(code: string, id: string) {
      const ignoreNameSet = new Set()
      let newCode = code
      if (fileRegex.test(id)) {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        })
        traverse(ast, {
          ImportDeclaration(path) {
            const comments = getComments(path.node)
            if (hasRemoveNextPrefix(comments, params.label)) {
              const moduleName = getImportName(path.node)
              if (moduleName) {
                ignoreNameSet.add(moduleName)
                path.remove()
              }
            }
          },
          VariableDeclaration(path) {
            const comments = getComments(path.node)
            if (hasRemoveNextPrefix(comments, params.label)) {
              const moduleName = getVariableName(path.node)
              if (moduleName) {
                ignoreNameSet.add(moduleName)
                path.remove()
              }
            }
          },
          JSXElement(path) {
            if (ignoreNameSet.size === 0) return

            if (t.isJSXOpeningElement(path.node.openingElement) && t.isJSXIdentifier(path.node.openingElement.name)) {
              const jsxElementName = path.node.openingElement.name
              if (t.isJSXIdentifier(jsxElementName)) {
                if (ignoreNameSet.has(jsxElementName.name)) {
                  if (t.isReturnStatement(path?.parentPath?.node)) {
                    path.replaceWith(t.nullLiteral())
                    return
                  }
                  path.remove()
                }
              }
            }
          },
        })
        const output = generate(ast)
        newCode = output.code
      }
      return { code: newCode ,map:null}
    },
  }
}
