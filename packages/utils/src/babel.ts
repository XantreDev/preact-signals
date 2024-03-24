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
  ): Set<BabelTypes.Identifier> | null => {
    return self.get(pass, identifiersForReplace) ?? null;
  },
  setShouldBeReplaced: (pass: PluginPass, v: BabelTypes.Identifier) => {
    let set = self.getShouldBeReplacedSet(pass);
    if (!set) {
      set = new Set();
      self.set(pass, identifiersForReplace, set);
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
): () => BabelTypes.Identifier {
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
    }

    let reference: BabelTypes.Identifier = self.get(
      pass,
      `requires/${importName}`
    );
    if (reference) {
      return t.cloneNode(reference);
    }
    reference = addNamed(path, importName, source, {
      importedInterop: "uncompiled",
    });
    // TODO: use this code in safe-react babel plugin
    path.traverse({
      VariableDeclaration(path) {
        for (const declarator of path.get("declarations")) {
          if (
            declarator.node.id.type === "Identifier" &&
            declarator.node.id.name === importName
          ) {
            path.scope.registerDeclaration(declarator);
            break;
          }
        }
      },
    });
    self.set(pass, `requires/${importName}`, reference);

    return reference;
  };
}

interface PluginArgs {
  types: typeof BabelTypes;
  template: typeof BabelTemplate;
}

const reactiveRefIdent = "importIdentifier";
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

const processRefMacros = (
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  importLazily: ReturnType<typeof createImportLazily>
) => {
  if (path.scope.references["$$"]) {
    const binding = path.scope.getBinding("$$");
    if (!binding) return;
    let remove: () => void;
    if (
      binding.path.node.type === "VariableDeclarator" &&
      isVariableDeclaratorRefMacros(
        // ts cannot lower the type
        binding.path as NodePath<BabelTypes.VariableDeclarator>
      )
    ) {
      remove = () => {
        if (binding.references !== 0) {
          throw new Error("Expected no references");
        }
        binding.path.remove();
      };
    } else if (
      binding.path.node.type === "ImportSpecifier" &&
      binding.path.parent.type === "ImportDeclaration" &&
      isImportMacrosName(binding.path.parent.source.value)
    ) {
      remove = () => {
        if (binding.references !== 0) {
          throw new Error("Expected no references");
        }
        const partentPath = binding.path.parentPath;
        if (!partentPath) {
          throw new Error("Expected a parent path");
        }
        partentPath.remove();
      };
    } else {
      return;
    }

    const paths = binding?.referencePaths;
    if (!paths) return;

    for (const path of paths) {
      const parent = path.parentPath;
      if (!parent) continue;
      if (parent.node.type !== "CallExpression") {
        throw new Error("Expected a CallExpression");
      }
      const arg = parent.node.arguments[0];
      if (!arg || !t.isExpression(arg)) continue;
      parent.node.callee = importLazily();
      parent.node.arguments = [t.arrowFunctionExpression([], arg)];

      binding.dereference();
    }
    remove();
  }
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
          const importLazily = createImportLazily(
            t,
            state,
            path,
            "$",
            "@preact-signals/utils"
          );
          self.set(state, reactiveRefIdent, importLazily);

          processRefMacros(path, t, importLazily);
        },
      },
      VariableDeclaration(path, state) {
        if (!enableStateMacros) {
          return;
        }
        for (const child of path.get("declarations")) {
          const idType = child.node.id.type;
          if (idType !== "Identifier") continue;
          const macros = getStateMacros(child.node);
          if (!macros) continue;

          self.setShouldBeReplaced(state, child.node.id);
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
