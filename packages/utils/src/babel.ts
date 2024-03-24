import {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
} from "@babel/core";
import type { Binding } from "@babel/traverse";
import { isModule, addNamed } from "@babel/helper-module-imports";
import assert from "node:assert";

const PLUGIN_NAME = "@preact-signals/utils/babel";
type PluginStoreMap = {
  // remove
  identifiersForReplace: Set<BabelTypes.Identifier>;
  $stateIdentifier: Set<BabelTypes.Identifier>;
  $bindedStateIdentifier: Set<BabelTypes.Identifier>;
} & Record<`${"imports" | "requires"}/${string}`, BabelTypes.Identifier>;

const self = {
  get: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T
  ): PluginStoreMap[T] | undefined => pass.get(`${PLUGIN_NAME}/${name}`),
  set: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T,
    v: PluginStoreMap[T]
  ) => pass.set(`${PLUGIN_NAME}/${name}`, v),
  addToSet: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T,
    v: PluginStoreMap[T] extends Set<infer U> ? U : never
  ) => {
    let set = self.get(pass, name) as undefined | Set<any>;

    if (!set) {
      set = new Set();
      // @ts-expect-error complex types
      self.set(pass, name, set);
    }
    set.add(v);
  },
  hasInSet: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T,
    v: PluginStoreMap[T] extends Set<infer U> ? U : never
  ) => {
    const set = self.get(pass, name);
    if (!set) return false;
    // @ts-expect-error complex types
    return set.has(v);
  },
  setShouldBeReplaced: (pass: PluginPass, v: BabelTypes.Identifier) => {
    self.addToSet(pass, "identifiersForReplace", v);
  },
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
      let reference = self.get(pass, `imports/${importName}`);
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

    let reference = self.get(pass, `requires/${importName}`);
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
): [BabelTypes.Identifier, BabelTypes.Expression] | null => {
  if (!node.init || node.init.type !== "CallExpression") return null;
  if (
    node.init.callee.type !== "Identifier" ||
    (node.init.callee.name !== "$state" &&
      node.init.callee.name !== "$bindedState")
  ) {
    return null;
  }

  const args = node.init.arguments;
  if (node.id.type !== "Identifier") {
    throw SyntaxErrorWithLoc.makeFromPosition(
      "Expected $state to be used with identifier for VariableDeclarator",
      node.id.loc?.start
    );
  }
  const nodeName = node.id.name;
  if (args.length === 0 || args.length > 1) {
    throw SyntaxErrorWithLoc.makeFromPosition(
      `Expected at exact one argument for ${nodeName}`,
      node.init.loc?.start
    );
  }
  const arg = args[0];
  if (
    !arg ||
    arg.type === "JSXNamespacedName" ||
    arg.type === "ArgumentPlaceholder" ||
    arg.type === "SpreadElement"
  ) {
    throw SyntaxErrorWithLoc.makeFromPosition(
      `Argument for ${nodeName} expected to be a valid expression`,
      arg?.loc?.start
    );
  }
  return [node.id, arg];
};

export type BabelMacroPluginOptions = {
  enableStateMacros: boolean;
};

class SyntaxErrorWithLoc extends SyntaxError {
  loc: { line: number; column: number };
  private constructor(message: string, line: number, column: number) {
    super(message);
    this.loc = { line, column };
  }
  public static make(message: string, line: number, column: number) {
    return new SyntaxErrorWithLoc(message, line, column);
  }
  public static makeFromPosition(
    message: string,
    position: { line: number; column: number } | undefined
  ) {
    return position
      ? new SyntaxErrorWithLoc(message, position.line, position.column)
      : new SyntaxError(message);
  }
}

type MacroIdentifier = "$$" | "$state" | "$bindedState";

/**
 *
 * @param binding
 * @param importSpecifier
 * @returns null if there is no import to remove, otherwise a function to remove the import
 */
const createRemoveImport = (
  scope: { removeBinding: (name: string) => void },
  binding: Binding,
  importSpecifier: MacroIdentifier
): null | (() => void) => {
  if (
    binding.path.isVariableDeclarator() &&
    isVariableDeclaratorRefMacros(binding.path)
  ) {
    const varDecl = binding.path;
    return () => {
      if (varDecl.node.id.type === "ObjectPattern") {
        if (varDecl.node.id.properties.length > 1) {
          for (const prop of varDecl.node.id.properties) {
            if (prop.type === "RestElement") {
              throw SyntaxErrorWithLoc.makeFromPosition(
                "Rest elements are not supported",
                prop.loc?.start
              );
            }
          }
          const elIndex = varDecl.node.id.properties.findIndex((prop) => {
            return (
              prop.type === "ObjectProperty" &&
              prop.key.type === "Identifier" &&
              prop.key.name === importSpecifier
            );
          });
          if (elIndex !== -1) {
            varDecl.node.id.properties.splice(elIndex, 1);
            scope.removeBinding(importSpecifier);
            return;
          }
        }
      }
      binding.path.remove();
      scope.removeBinding(importSpecifier);
    };
  }
  if (
    binding.path.node.type === "ImportSpecifier" &&
    binding.path.parent.type === "ImportDeclaration" &&
    isImportMacrosName(binding.path.parent.source.value)
  ) {
    const parentPath = binding.path.parentPath;
    return () => {
      if (!parentPath) {
        throw new Error("invariant: importSpecifier should have a parentPath");
      }
      parentPath.remove();
      scope.removeBinding(importSpecifier);
    };
  }

  return null;
};

const processRefMacros = (
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  importRefLazily: ReturnType<typeof createImportLazily>
) => {
  const bindingName = "$$";
  if (!path.scope.references[bindingName]) return;

  const binding = path.scope.getBinding(bindingName);
  if (!binding) return;

  const paths = binding?.referencePaths;
  if (!paths) return;
  const remove = createRemoveImport(path.scope, binding, bindingName);
  if (!remove) {
    return;
  }

  for (const path of paths) {
    const parent = path.parentPath;
    if (!parent || parent.node.type !== "CallExpression") {
      throw SyntaxErrorWithLoc.makeFromPosition(
        "$$ expected to be used only inside of CallExpressions",
        (parent ?? path).node.loc?.start
      );
    }
    if (parent.node.arguments.length !== 1) {
      throw SyntaxErrorWithLoc.makeFromPosition(
        "$$ expected to be called with exactly one argument",
        parent.node.loc?.start
      );
    }
    const arg = parent.node.arguments[0];
    if (!arg) {
      throw Error("invariant: Arg cannot be null");
    }
    if (!t.isExpression(arg)) {
      throw SyntaxErrorWithLoc.makeFromPosition(
        "$$ expected to be called with an expression",
        arg.loc?.start
      );
    }

    parent.node.callee = importRefLazily();
    parent.node.arguments = [t.arrowFunctionExpression([], arg)];

    binding.dereference();
  }
  if (binding.references !== 0) {
    throw new Error("invariant: Expected no references");
  }
  remove();
  path.scope.removeBinding(bindingName);
};

const processStateMacros = (
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  state: PluginPass
  // importLazily: ReturnType<typeof createImportLazily>
) => {
  const stateMacros = ["$state", "$bindedState"] as const;

  for (const macro of stateMacros) {
    if (!path.scope.references[macro]) {
      continue;
    }
    const binding = path.scope.getBinding(macro);
    if (!binding) {
      continue;
    }
    const remove = createRemoveImport(path.scope, binding, macro);
    if (!remove) {
      continue;
    }

    if (!binding.referencePaths || binding.referencePaths.length === 0) {
      remove();
      continue;
    }

    for (const path of binding.referencePaths) {
      const callParent = path.parentPath;
      if (!callParent || !callParent.isCallExpression()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          "Expected $state to be used only as call expressions",
          (callParent ?? path).node.loc?.start
        );
      }
      const parent = callParent.parentPath;
      if (!parent || !parent.isVariableDeclarator()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          "Expected $state to be used only in variable declarations",
          path.node.loc?.start
        );
      }
      if (!parent.parentPath.isVariableDeclaration()) {
        throw new Error(
          "invariant: parentPath should be a VariableDeclaration"
        );
      }
      if (
        parent.parentPath.node.kind !== "const" &&
        macro === "$state" &&
        parent.parentPath.node.kind !== "let"
      ) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          macro === "$state"
            ? `${macro} should be used with const`
            : `${macro} should be used with let`,
          path.node.loc?.start
        );
      }
      const res = getStateMacrosBody(parent.node);
      if (!res) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          "Expected $state to have a valid body",
          path.node.loc?.start
        );
      }
      const [id, body] = res;

      callParent.replaceWith(t.cloneNode(body));
      self.addToSet(
        state,
        macro === "$state" ? "$stateIdentifier" : "$bindedStateIdentifier",
        id
      );

      const varBinding = path.scope.getBinding(id.name);
      if (!varBinding) {
        throw new Error("invariant: Expected a binding");
      }

      for (const refPath of varBinding.referencePaths) {
        refPath.replaceWith(
          t.memberExpression(t.cloneNode(id), t.identifier("value"))
        );
      }

      binding.dereference();
    }
    if (binding.references !== 0) {
      throw new Error("invariant: Expected no references");
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
          processRefMacros(
            path,
            t,
            createImportLazily(t, state, path, "$", "@preact-signals/utils")
          );

          if (enableStateMacros) {
            processStateMacros(path, t, state);
          }
        },
      },
      AssignmentExpression(path, state) {
        if (!enableStateMacros) {
          return;
        }
        // replacing state macro assignments
        if (path.node.left.type !== "Identifier") {
          return;
        }
        const ident = path.scope.getBindingIdentifier(path.node.left.name);
        if (!ident) {
          return;
        }
        if (self.hasInSet(state, "$stateIdentifier", ident)) {
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
          return;
        }
        if (self.hasInSet(state, "$bindedStateIdentifier", ident)) {
          throw SyntaxErrorWithLoc.makeFromPosition(
            "Cannot assign to a binded state",
            path.node.loc?.start
          );
        }
      },
    },
  };
}
