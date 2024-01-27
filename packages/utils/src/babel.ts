import {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
} from "@babel/core";
import { isModule, addNamed } from "@babel/helper-module-imports";

const PLUGIN_NAME = "@preact-signals/utils/babel";
const self = {
  get: (pass: PluginPass, name: any) => pass.get(`${PLUGIN_NAME}/${name}`),
  set: (pass: PluginPass, name: string, v: any) =>
    pass.set(`${PLUGIN_NAME}/${name}`, v),
};

function createImportLazily(
  t: typeof BabelTypes,
  pass: PluginPass,
  path: NodePath<BabelTypes.Program>,
  importName: string,
  source: string
): () => BabelTypes.Identifier | BabelTypes.MemberExpression {
  return () => {
    if (isModule(path)) {
      let reference: BabelTypes.Identifier = self.get(
        pass,
        `imports/${importName}`
      );
      if (reference) return t.cloneNode(reference);
      reference = addNamed(path, importName, source, {
        importedInterop: "uncompiled",
        importPosition: "after",
      });
      self.set(pass, `imports/${importName}`, reference);

      const matchesImportName = (
        s: BabelTypes.ImportDeclaration["specifiers"][0]
      ) => {
        if (s.type !== "ImportSpecifier") return false;
        return (
          (s.imported.type === "Identifier" &&
            s.imported.name === importName) ||
          (s.imported.type === "StringLiteral" &&
            s.imported.value === importName)
        );
      };

      for (let statement of path.get("body")) {
        if (
          statement.isImportDeclaration() &&
          statement.node.source.value === source &&
          statement.node.specifiers.some(matchesImportName)
        ) {
          path.scope.registerDeclaration(statement);
          break;
        }
      }
      return reference;
    } else {
      let reference = self.get(pass, `requires/${importName}`);
      if (reference) {
        reference = t.cloneNode(reference);
      } else {
        reference = addNamed(path, importName, source, {
          importedInterop: "uncompiled",
        });
        self.set(pass, `requires/${importName}`, reference);
      }

      return reference;
    }
  };
}

interface PluginArgs {
  types: typeof BabelTypes;
  template: typeof BabelTemplate;
}

const reactiveRefIdent = "importIdentifier";
const hasMacrosReference = "hasMacrosReference";

const isImportMacrosName = (name: string) => "@preact-signals/utils/macro";

export default function preactSignalsUtilsBabel(
  { types: t }: PluginArgs,
  options: Record<never, never>
): PluginObj {
  return {
    name: PLUGIN_NAME,
    visitor: {
      Program: {
        enter(path, state) {
          self.set(
            state,
            reactiveRefIdent,
            createImportLazily(t, state, path, "$", "@preact-signals/utils")
          );
        },
      },
      CallExpression(path, state) {
        const callee = path.node.callee;
        if (callee.type !== "Identifier" || callee.name !== "$$") {
          return;
        }
        const paths = path.scope.bindings;
        if (paths[callee.name] || !self.get(state, hasMacrosReference)) return;

        const arg = path.node.arguments[0];

        if (!arg || !t.isExpression(arg)) return;

        path.replaceWith(
          t.callExpression(self.get(state, reactiveRefIdent)(), [
            t.arrowFunctionExpression(
              [],
              arg ?? t.expressionStatement(t.identifier("undefined"))
            ),
          ])
        );
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value !== "@preact-signals/utils/macro") return;
        self.set(state, hasMacrosReference, true);
        path.remove();
      },
      VariableDeclaration(path, state) {
        const isMacros = (child: NodePath<BabelTypes.VariableDeclarator>) =>
          looksLike(child, {
            node: {
              init: {
                callee: {
                  type: "Identifier",
                  name: "require",
                },
                arguments: (args: [{ value: string }]) =>
                  args.length === 1 && isImportMacrosName(args[0].value),
              },
            },
          });

        path
          .get("declarations")
          .filter(isMacros)
          .forEach((child) => {
            self.set(state, hasMacrosReference, true);
            child.remove();
          });
      },
    },
  };
}

function looksLike(a: unknown, b: unknown): boolean {
  return (
    !!a &&
    !!b &&
    Object.keys(b).every((bKey) => {
      const bVal = (b as any)[bKey];
      const aVal = (a as any)[bKey];
      if (typeof bVal === "function") {
        return bVal(aVal);
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
}

function isPrimitive(val: unknown) {
  return val == null || /^[sbn]/.test(typeof val);
}
