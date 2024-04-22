import {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
} from "@babel/core";
import type { Binding } from "@babel/traverse";
import { isModule, addNamed } from "@babel/helper-module-imports";

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}
function assert(
  condition: unknown,
  message: string | Error
): asserts condition {
  if (!condition) {
    throw typeof message === "object" ? message : new AssertionError(message);
  }
}

const PLUGIN_NAME = "@preact-signals/utils/babel";
type PluginStoreMap = Record<
  `ident/${StateMacros}`,
  Set<BabelTypes.Identifier>
> &
  Record<`${"imports" | "requires"}/${string}`, BabelTypes.Identifier>;

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
};

const getIdentKey = <T extends StateMacros>(macro: T) =>
  `ident/${macro}` as const;

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

type ConstructorType = "raw" | "callback";
const stateMacrosMeta = {
  $state: {
    declarationType: ["const", "let"],
    canBeReassigned: true,

    isHook: false,
    constructorType: "raw",
    importIdent: "deepSignal",
    importSource: "@preact-signals/utils",
  },
  $useState: {
    declarationType: ["let", "const"],
    canBeReassigned: true,
    isHook: true,
    constructorType: "callback",
    importIdent: "useDeepSignal",
    importSource: "@preact-signals/utils/hooks",
  },
  $useLinkedState: {
    declarationType: ["const"],
    canBeReassigned: false,
    isHook: true,
    constructorType: "raw",
    importIdent: "useSignalOfState",
    importSource: "@preact-signals/utils/hooks",
  },

  $derived: {
    declarationType: ["const"],
    canBeReassigned: false,
    isHook: false,
    constructorType: "callback",
    importIdent: "computed",
    importSource: "@preact-signals/utils/macro-helper",
  },
  $useDerived: {
    declarationType: ["const"],
    canBeReassigned: false,
    isHook: true,
    constructorType: "callback",
    importIdent: "useComputed",
    importSource: "@preact-signals/utils/macro-helper",
  },
} as const satisfies Record<
  string,
  {
    declarationType: ("let" | "const")[];
    constructorType: ConstructorType;
    canBeReassigned: boolean;
    isHook: boolean;
    importIdent: string;
    importSource: string;
  }
>;

const createState = (
  t: typeof BabelTypes,
  ident: BabelTypes.Identifier,
  expr: BabelTypes.Expression,
  constructorType: ConstructorType
) =>
  t.callExpression(ident, [
    constructorType === "callback" ? t.arrowFunctionExpression([], expr) : expr,
  ]);

const keys = <T extends string>(obj: Readonly<Record<T, any>>) =>
  Object.keys(obj) as T[];

const stateMacros = keys(stateMacrosMeta);
const refMacro = "$$" as const;

const importSpecifiers = [...stateMacros, refMacro];

type RefMacro = typeof refMacro;
type StateMacros = (typeof stateMacros)[number];
type MacroIdentifier = RefMacro | StateMacros;

const getStateMacrosBody = (
  node: BabelTypes.VariableDeclarator
): [BabelTypes.Identifier, BabelTypes.Expression] | null => {
  if (!node.init || node.init.type !== "CallExpression") return null;
  if (
    node.init.callee.type !== "Identifier" ||
    (stateMacros as readonly string[]).indexOf(node.init.callee.name) === -1
  ) {
    return null;
  }

  const args = node.init.arguments;
  if (node.id.type !== "Identifier") {
    throw SyntaxErrorWithLoc.makeFromPosition(
      "Expected $useState to be used with identifier for VariableDeclarator",
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
  experimental_stateMacros: boolean;
};

export class SyntaxErrorWithLoc extends SyntaxError {
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
            if (prop.value.type !== "Identifier") {
              throw SyntaxErrorWithLoc.makeFromPosition(
                "Expected import from macros to be an identifier",
                prop.value.loc?.start
              );
            }
            if (prop.shorthand) {
              assert(
                prop.key.type === "Identifier" &&
                  importSpecifiers.includes(prop.key.name as MacroIdentifier),
                SyntaxErrorWithLoc.makeFromPosition(
                  `Expected to be Identifier and key to be one of ${importSpecifiers.join(
                    ", "
                  )}`,
                  prop.key.loc?.start
                )
              );
            }

            assert(
              prop.key.type === "Identifier" &&
                prop.value.type === "Identifier" &&
                prop.key.name === prop.value.name &&
                importSpecifiers.includes(prop.key.name as MacroIdentifier),
              SyntaxErrorWithLoc.makeFromPosition(
                `Expected key to be one of ${importSpecifiers.join(", ")}`,
                prop.key.loc?.start
              )
            );
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
    for (const specifier of binding.path.parent.specifiers) {
      assert(specifier.type === "ImportSpecifier", "Expected ImportSpecifier");

      const value =
        specifier.imported.type === "Identifier"
          ? specifier.imported.name
          : specifier.imported.value;
      if (!importSpecifiers.includes(value as MacroIdentifier)) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected ${value} to be one of ${importSpecifiers.join(", ")}`,
          specifier.imported.loc?.start
        );
      }
    }
    const parentPath = binding.path.parentPath;

    if (!parentPath) {
      throw new Error("invariant: importSpecifier should have a parentPath");
    }
    assert(parentPath.isImportDeclaration(), "Expected ImportDeclaration");
    return () => {
      if (parentPath.node.specifiers.length === 1) {
        parentPath.remove();
      } else {
        const specifier = parentPath
          .get("specifiers")
          .find(({ node: spec }) => {
            return (
              spec.type === "ImportSpecifier" &&
              spec.imported.type === "Identifier" &&
              spec.imported.name === importSpecifier
            );
          });
        assert(
          specifier?.type === "ImportSpecifier",
          SyntaxErrorWithLoc.makeFromPosition(
            `Expected ${importSpecifier} to be an ImportSpecifier`,
            specifier?.node.loc?.start
          )
        );
        specifier.remove();
      }

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
  if (!path.scope.references[refMacro]) return;

  const binding = path.scope.getBinding(refMacro);
  if (!binding) return;

  const paths = binding?.referencePaths;
  if (!paths) return;
  const remove = createRemoveImport(path.scope, binding, refMacro);
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
  path.scope.removeBinding(refMacro);
};

type LazyIdent = () => BabelTypes.Identifier;

const includes = (arr: readonly string[], name: string) => arr.includes(name);

const processStateMacros = (
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  state: PluginPass,
  importLazily: Record<StateMacros, LazyIdent>
) => {
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
    const macroMeta = stateMacrosMeta[macro];

    for (const path of binding.referencePaths) {
      const callParent = path.parentPath;
      if (!callParent || !callParent.isCallExpression()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected ${macro} to be used only as call expressions`,
          (callParent ?? path).node.loc?.start
        );
      }
      const parent = callParent.parentPath;
      if (!parent || !parent.isVariableDeclarator()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected ${macro} to be used only in variable declarations`,
          path.node.loc?.start
        );
      }
      if (!parent.parentPath.isVariableDeclaration()) {
        throw new Error(
          "invariant: parentPath should be a VariableDeclaration"
        );
      }
      if (parent.parentPath.parentPath.isExportNamedDeclaration()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected ${macro} cannot be used in export statements`,
          parent.parentPath.parentPath.node.loc?.start
        );
      }
      {
        const loc = parent.node.loc?.start;
        if (!includes(macroMeta.declarationType, parent.parentPath.node.kind)) {
          throw SyntaxErrorWithLoc.makeFromPosition(
            `${macro} should be used with ${macroMeta.declarationType.join(" or ")}`,
            loc
          );
        }
      }
      const res = getStateMacrosBody(parent.node);
      if (!res) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected "${macro}" to have a valid body`,
          path.node.loc?.start
        );
      }
      const [id, body] = res;
      {
        const functionParent = parent.getFunctionParent();
        if (!functionParent && macroMeta.isHook) {
          throw SyntaxErrorWithLoc.makeFromPosition(
            `Expected "${macro}" to be used inside of a function, because it's a hook`,
            parent.node.loc?.start
          );
        }
      }

      const constructorIdent = importLazily[macro]();
      const [referencePath] = callParent.replaceWith(
        createState(
          t,
          constructorIdent,
          body,
          stateMacrosMeta[macro].constructorType
        )
      );
      path.scope.getBinding(constructorIdent.name)?.reference(referencePath);
      self.addToSet(state, getIdentKey(macro), id);

      const varBinding = path.scope.getBinding(id.name);
      if (!varBinding) {
        throw new Error("invariant: Expected a binding");
      }

      for (const refPath of varBinding.referencePaths) {
        if (refPath.parentPath?.isExportSpecifier()) {
          throw SyntaxErrorWithLoc.makeFromPosition(
            `Cannot export ${macro} variable`,
            refPath.node.loc?.start
          );
        }

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

const mapValues = <T extends Record<string, any>, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> => {
  const res: Record<keyof T, U> = {} as Record<keyof T, U>;
  for (const key in obj) {
    res[key] = fn(obj[key], key);
  }
  return res;
};

export default function preactSignalsUtilsBabel(
  { types: t }: PluginArgs,
  options?: BabelMacroPluginOptions
): PluginObj {
  const enableStateMacros = options?.experimental_stateMacros;

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
            processStateMacros(
              path,
              t,
              state,
              mapValues(stateMacrosMeta, (data) =>
                createImportLazily(
                  t,
                  state,
                  path,
                  data.importIdent,
                  data.importSource
                )
              )
            );
          }
        },
      },

      ImportDeclaration(path) {
        if (
          !isImportMacrosName(path.node.source.value) ||
          path.node.importKind === "type"
        ) {
          return;
        }
        for (const specifier of path.get("specifiers")) {
          assert(
            specifier.isImportSpecifier(),
            SyntaxErrorWithLoc.makeFromPosition(
              `Only import named imports is allowed from macro entry, got ${specifier.type}`,
              specifier.node.loc?.start
            )
          );
          if (specifier.node.importKind !== null) {
            return;
          }
          const { local, imported } = specifier.node;
          assert(
            includes(importSpecifiers, local.name),
            SyntaxErrorWithLoc.makeFromPosition(
              `Expected ${specifier.node.local.name} to be one of ${importSpecifiers.join(", ")}`,
              specifier.node.loc?.start
            )
          );
          assert(
            imported.type === "Identifier",
            SyntaxErrorWithLoc.makeFromPosition(
              `Expected ${specifier.node.imported} to be an Identifier, not a ${imported.type}`,
              imported.loc?.start
            )
          );

          assert(
            imported.name === local.name,
            SyntaxErrorWithLoc.makeFromPosition(
              `Expected ${imported.name} to be equal to ${local.name}`,
              imported.loc?.start
            )
          );
        }
      },

      AssignmentExpression(path, state) {
        if (!enableStateMacros) {
          return;
        }
        // replacing state macro assignments
        if (path.node.left.type !== "Identifier") {
          return;
        }
        const left = path.node.left;
        const binding = path.scope.getBinding(path.node.left.name);
        if (!binding) {
          return;
        }
        const ident = binding.identifier;
        for (const key of stateMacros) {
          const { canBeReassigned } = stateMacrosMeta[key];
          if (!self.hasInSet(state, getIdentKey(key), ident)) {
            continue;
          }

          assert(
            canBeReassigned,
            SyntaxErrorWithLoc.makeFromPosition(
              `Cannot assign to a binded state`,
              path.node.loc?.start
            )
          );
          assert(
            binding.kind !== "const",
            SyntaxErrorWithLoc.makeFromPosition(
              `Cannot reassign a constant binding`,
              path.node.loc?.start
            )
          );

          path.replaceWith(
            t.assignmentExpression(
              path.node.operator,
              t.memberExpression(t.cloneNode(left), t.identifier("value")),
              path.node.right
            )
          );

          break;
        }
      },
    },
  };
}
