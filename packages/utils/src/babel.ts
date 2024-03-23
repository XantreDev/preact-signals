import {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
} from "@babel/core";
import { isModule, addNamed } from "@babel/helper-module-imports";
import assert from "node:assert";

const PLUGIN_NAME = "@preact-signals/utils/babel";
const self = {
  get: (pass: PluginPass, name: any) => pass.get(`${PLUGIN_NAME}/${name}`),
  set: (pass: PluginPass, name: string, v: any) =>
    pass.set(`${PLUGIN_NAME}/${name}`, v),
  getShouldBeReplacedSet: (
    pass: PluginPass
  ): Set<BabelTypes.Identifier> | undefined => {
    return self.get(pass, hasMacrosReference);
  },
  setShouldBeReplaced: (pass: PluginPass, v: BabelTypes.Identifier) => {
    let set = self.getShouldBeReplacedSet(pass);
    if (!set) {
      set = new Set();
      self.set(pass, hasMacrosReference, set);
    }
    set.add(v);
  },
  getShouldBeReplaced: (pass: PluginPass, v: BabelTypes.Identifier) =>
    (v.type === "Identifier" && self.getShouldBeReplacedSet(pass)?.has(v)) ??
    false,
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
const identifiersForReplace = "identifiersForReplace";

const isImportMacrosName = (name: string) =>
  name === "@preact-signals/utils/macro";

const isVariableDeclaratorRefMacros = (
  child: NodePath<BabelTypes.VariableDeclarator>
) =>
  child.node.init?.type === "CallExpression" &&
  child.node.init.callee.type === "Identifier" &&
  child.node.init.callee.name === "require" &&
  child.node.init.arguments.length === 1 &&
  child.node.init.arguments[0]?.type === "StringLiteral" &&
  isImportMacrosName(child.node.init.arguments[0].value);

type StateMacros = "$bindedState" | "$state";

const getStateMacros = (
  node: BabelTypes.VariableDeclarator
): StateMacros | null => {
  if (!node.init || node.init.type !== "CallExpression") return null;
  if (node.init.callee.type !== "Identifier") return null;
  const calleeName = node.init.callee.name;

  if (calleeName === "$state") return "$state";
  if (calleeName === "$bindedState") return "$bindedState";

  return null;
};

const getStateMacrosBody = (
  node: BabelTypes.VariableDeclarator
): BabelTypes.Expression | null => {
  if (!node.init || node.init.type !== "CallExpression") return null;
  if (
    node.init.callee.type !== "Identifier" ||
    (node.init.callee.name !== "$state" &&
      node.init.callee.name !== "$bindedState")
  ) {
    return null;
  }

  const args = node.init.arguments;
  if (args.length === 0) {
    throw new Error("Expected at least one argument");
  }
  if (args.length > 1) {
    throw new Error("Expected only one argument");
  }
  const arg = args[0];
  if (
    !arg ||
    arg.type === "JSXNamespacedName" ||
    arg.type === "ArgumentPlaceholder" ||
    arg.type === "SpreadElement"
  ) {
    throw new Error("Expected a valid argument");
  }
  return arg;
};

export type BabelMacroPluginOptions = {
  enableStateMacros: boolean;
};

export default function preactSignalsUtilsBabel(
  { types: t }: PluginArgs,
  options?: BabelMacroPluginOptions
): PluginObj {
  const enableStateMacros = options?.enableStateMacros;

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
        if (!isImportMacrosName(path.node.source.value)) return;
        self.set(state, hasMacrosReference, true);
        path.remove();
      },
      VariableDeclaration(path, state) {
        for (const child of path.get("declarations")) {
          if (isVariableDeclaratorRefMacros(child)) {
            self.set(state, hasMacrosReference, true);
            child.remove();
            continue;
          }
          if (!enableStateMacros) {
            continue;
          }
          // TODO: Add reference checking
          const idType = child.node.id.type;
          if (idType !== "Identifier") continue;
          const macros = getStateMacros(child.node);
          if (!macros) continue;

          self.setShouldBeReplaced(state, child.node.id);
          // const binding = path.scope.getBinding(child.node.id.name);
          const binding = path.scope.getBinding(child.node.id.name);
          // replacing bindings
          for (const path of binding?.referencePaths ?? []) {
            assert(path.node.type === "Identifier");
            path.replaceWith(
              t.memberExpression(t.cloneNode(path.node), t.identifier("value"))
            );
          }
        }
      },
      AssignmentExpression(path, state) {
        if (!enableStateMacros) {
          return;
        }
        if (path.node.left.type !== "Identifier") {
          return;
        }
        const ident = path.scope.getBindingIdentifier(path.node.left.name);
        if (!self.getShouldBeReplaced(state, ident)) {
          return;
        }

        path.replaceWith(
          t.assignmentExpression(
            path.node.operator,
            t.memberExpression(
              t.cloneNode(path.node.left),
              t.identifier("value")
            ),
            path.node.right
          )
        );
      },
    },
  };
}

function isPrimitive(val: unknown) {
  return val == null || /^[sbn]/.test(typeof val);
}
