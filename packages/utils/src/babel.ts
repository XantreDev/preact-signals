import type {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
  types,
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

function assertTest(condition: unknown, message: string | Error) {
  if (
    typeof process !== "undefined" &&
    process?.env?.VITEST === "true" &&
    !condition
  ) {
    throw typeof message === "object" ? message : new AssertionError(message);
  }
}

const IdentFlags = {
  STATE: 1 << 0,
  DERIVED: 1 << 1,

  AS_IS: 1 << 2,
  AS_VALUE: 1 << 3,
  AS_PICK: 1 << 4,

  LET: 1 << 5,
  CONST: 1 << 6,
};

const PLUGIN_NAME = "@preact-signals/utils/babel";
type PluginStoreMap = Record<
  `ident/${StateMacros}`,
  Set<BabelTypes.Identifier>
> & {
  identFlags: WeakMap<BabelTypes.Identifier, number>;
  refImport: () => BabelTypes.Identifier;
  optimizationStack: number[];
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
  getRefImport: (pass: PluginPass) => self.get(pass, "refImport"),
  getOptimizationStack: (pass: PluginPass) => {
    let stack = self.get(pass, "optimizationStack");

    if (!stack) {
      stack = [];
      self.set(pass, "optimizationStack", stack);
    }

    return stack;
  },
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

const IdentFlagsHelper = {
  set: (pass: PluginPass, ident: BabelTypes.Identifier, flags: number) => {
    let flagsMap = self.get(pass, "identFlags");
    if (!flagsMap) {
      flagsMap = new WeakMap();
      self.set(pass, "identFlags", flagsMap);
    }
    flagsMap.set(ident, flags);
  },
  get: (pass: PluginPass, ident: BabelTypes.Identifier) => {
    return self.get(pass, "identFlags")?.get(ident) ?? null;
  },
  isChecked: (pass: PluginPass, ident: BabelTypes.Identifier) => {
    return IdentFlagsHelper.get(pass, ident) === null;
  },
  debug: (flags: number) => mapValues(IdentFlags, (value) => !!(value & flags)),
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

      for (const statement of path.get("body")) {
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
const derefMacro = "$deref" as const;

const importSpecifiers = [...stateMacros, refMacro, derefMacro];

type RefMacro = typeof refMacro;
type StateMacros = (typeof stateMacros)[number];
type MacroIdentifier = (typeof importSpecifiers)[number];

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
  experimental_stateMacrosOptimization: boolean;
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

  for (let i = paths.length - 1; i >= 0; --i) {
    const parent = paths[i]!.parentPath;
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
    const callee = importRefLazily();
    const [res] = parent.replaceWith(
      t.callExpression(callee, [t.arrowFunctionExpression([], arg)])
    );
    // crawling newly created scope
    res.scope.crawl();
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

const markAndRemoveMacros = (
  pass: PluginPass,
  refPath: NodePath<BabelTypes.Node>,
  id: BabelTypes.Identifier,
  parentFlag: number,
  macro: string,
  derefMacro: string,
  useJSXOptimizations: boolean
) => {
  if (refPath.parentPath?.isExportSpecifier()) {
    throw SyntaxErrorWithLoc.makeFromPosition(
      `Cannot export ${macro} variable`,
      refPath.node.loc?.start
    );
  }

  assert(
    refPath.isIdentifier(),
    SyntaxErrorWithLoc.makeFromPosition(
      "Expected $deref to be used with an identifier",
      refPath.node.loc?.start
    )
  );
  const parent = refPath.parentPath;
  const callee =
    refPath.parentPath?.isCallExpression() && refPath.parentPath.get("callee");
  if (
    parent &&
    callee &&
    callee.isIdentifier() &&
    callee.node.name === derefMacro
  ) {
    IdentFlagsHelper.set(pass, refPath.node, IdentFlags.AS_IS | parentFlag);

    return () => {
      parent.replaceWith(refPath.node);
      parent.scope.getBinding(derefMacro)?.dereference();
    };
  }
  if (parent.isVariableDeclarator()) {
    IdentFlagsHelper.set(pass, refPath.node, IdentFlags.AS_IS | parentFlag);
    return;
  }

  if (useJSXOptimizations && parent && parent.isJSXExpressionContainer()) {
    IdentFlagsHelper.set(pass, refPath.node, IdentFlags.AS_VALUE | parentFlag);

    return;
  }

  IdentFlagsHelper.set(pass, id, IdentFlags.AS_VALUE | parentFlag);

  // TODO: optimize this back traversal (maybe plugin should be ran after main traversal with meta info about JSXExpressionContainer-s)
  /* if (useJSXOptimizations) {
    let parentNode: NodePath<types.Node> | null = path.parentPath;
    while (
      parentNode &&
      !parentNode?.isFunction() &&
      !parentNode?.isExpressionStatement() &&
      !parentNode?.isProgram() &&
      !parentNode?.isJSXExpressionContainer()
    ) {
      parentNode = parentNode?.parentPath ?? null;
    }

    if (parentNode?.isJSXExpressionContainer()) {
      const expr = parentNode.get("expression");
      parentNode
        .replaceWith(
          t.jsxExpressionContainer(
            t.callExpression(importRefLazily(), [
              t.arrowFunctionExpression([], expr.node as BabelTypes.Expression),
            ])
          )
        )[0]
        .scope.crawl();
    }
  } */
};

const processStateMacros = (
  pass: PluginPass,
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  importLazily: Record<StateMacros, LazyIdent>,
  useJSXOptimizations: boolean
) => {
  const mutations: (() => void)[] = [];
  for (const macro of stateMacros) {
    if (!path.scope.references[macro]) {
      continue;
    }
    const macroBinding = path.scope.getBinding(macro);
    if (!macroBinding) {
      continue;
    }
    const remove = createRemoveImport(path.scope, macroBinding, macro);
    if (!remove) {
      continue;
    }

    if (
      !macroBinding.referencePaths ||
      macroBinding.referencePaths.length === 0
    ) {
      remove();
      continue;
    }
    const macroMeta = stateMacrosMeta[macro];

    for (const path of macroBinding.referencePaths) {
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
      callParent.replaceWith(
        createState(
          t,
          constructorIdent,
          body,
          stateMacrosMeta[macro].constructorType
        )
      );
      // path.scope.getBinding(constructorIdent.name)?.reference(referencePath.get('callee'));
      // self.addToSet(pass, getIdentKey(macro), id);

      const varBinding = path.scope.getBinding(id.name);
      if (!varBinding) {
        throw new Error("invariant: Expected a binding");
      }

      const stateFlag =
        (macroMeta.canBeReassigned ? IdentFlags.STATE : IdentFlags.DERIVED) |
        (varBinding.kind === "const" ? IdentFlags.CONST : IdentFlags.LET);

      IdentFlagsHelper.set(pass, id, stateFlag | IdentFlags.AS_IS);

      // we need to skip declaration itself
      for (let i = 0; i < varBinding.referencePaths.length; ++i) {
        // console.log(varBinding.referencePaths[i]?.node === id);

        const mut = markAndRemoveMacros(
          pass,
          varBinding.referencePaths[i]!,
          id,
          stateFlag,
          macro,
          derefMacro,
          useJSXOptimizations
        );
        if (mut) {
          mutations.push(mut);
        }
      }
      macroBinding.dereference();
    }

    if (macroBinding.references !== 0) {
      throw new Error("invariant: Expected no references");
    }
    remove();
  }
  for (const mut of mutations) {
    mut();
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

function cleanDerefImport(
  path: NodePath<BabelTypes.Program>,
  enableStateMacros: boolean | undefined
) {
  const derefBinding = path.scope.getBinding(derefMacro);
  if (derefBinding && enableStateMacros) {
    if (derefBinding.referenced) {
      const firstItem = derefBinding.referencePaths[0];
      assert(firstItem, "invariant: referenced");
      throw SyntaxErrorWithLoc.makeFromPosition(
        `Expected all references to $deref to be removed`,
        firstItem.node.loc?.start
      );
    }
    createRemoveImport(path.scope, derefBinding, "$deref")?.();
  }
}

export default function preactSignalsUtilsBabel(
  { types: t }: PluginArgs,
  options?: BabelMacroPluginOptions
): PluginObj {
  const enableStateMacros = options?.experimental_stateMacros;
  assert(
    options?.experimental_stateMacrosOptimization
      ? options.experimental_stateMacros
      : true,
    "Cannot enable experimental_stateMacrosOptimization without enabling experimental_stateMacros"
  );
  const enableStateMacrosOptimization =
    options?.experimental_stateMacrosOptimization;

  return {
    name: PLUGIN_NAME,
    visitor: {
      Program: {
        enter(path, pass) {
          const importLazyIdent = createImportLazily(
            t,
            pass,
            path,
            "$",
            "@preact-signals/utils"
          );
          processRefMacros(path, t, importLazyIdent);

          if (enableStateMacros) {
            processStateMacros(
              pass,
              path,
              t,
              mapValues(stateMacrosMeta, (data) =>
                createImportLazily(
                  t,
                  pass,
                  path,
                  data.importIdent,
                  data.importSource
                )
              ),
              !!enableStateMacrosOptimization
            );
          }
        },
        exit(path) {
          cleanDerefImport(path, enableStateMacros);

          path.scope.crawl();
        },
      },
      Identifier: {
        enter(path, pass) {
          const flags = IdentFlagsHelper.get(pass, path.node);
          // variable declarator check is redundant, but for some reason it doesn't working without it
          // `let a.value = deepSignal(0)` is produced
          if (flags === null || path.parentPath.isVariableDeclarator()) {
            return;
          }

          const asFlag =
            flags &
            (IdentFlags.AS_IS | IdentFlags.AS_PICK | IdentFlags.AS_VALUE);
          assertTest(
            asFlag === IdentFlags.AS_IS ||
              asFlag === IdentFlags.AS_VALUE ||
              asFlag === IdentFlags.AS_PICK,
            "Expected AS_IS, AS_VALUE or AS_PICK"
          );

          const stateFlag = flags & (IdentFlags.STATE | IdentFlags.DERIVED);
          assertTest(
            stateFlag === IdentFlags.STATE || stateFlag === IdentFlags.DERIVED,
            "Expected STATE or DERIVED"
          );

          const letConstFlag = flags & (IdentFlags.LET | IdentFlags.CONST);
          assertTest(
            letConstFlag === IdentFlags.LET ||
              letConstFlag === IdentFlags.CONST,
            "Expected LET or CONST"
          );

          const ident = path.node;

          if (flags & IdentFlags.AS_IS) {
            return;
          }
          if (flags & IdentFlags.AS_PICK) {
            path.replaceWith(
              t.callExpression(
                t.memberExpression(path.node, t.identifier("peek")),
                []
              )
            );
            const newFlags = (flags ^ IdentFlags.AS_PICK) | IdentFlags.AS_IS;
            IdentFlagsHelper.set(pass, ident, newFlags);
          } else if (flags & IdentFlags.AS_VALUE) {
            path.replaceWith(
              t.memberExpression(path.node, t.identifier("value"))
            );
            const newFlags = (flags ^ IdentFlags.AS_VALUE) | IdentFlags.AS_IS;
            IdentFlagsHelper.set(pass, ident, newFlags);
          }
        },
      },
      //#region exports validation
      ExportNamedDeclaration(path) {
        if (
          !isImportMacrosName(path.node.source?.value ?? "") ||
          path.node.exportKind === "type"
        ) {
          return;
        }

        for (const specifier of path.get("specifiers")) {
          assert(
            specifier.isExportSpecifier(),
            SyntaxErrorWithLoc.makeFromPosition(
              `Unexpected ${specifier.type}, you can reexport only types from macroses`,
              specifier.node.loc?.start
            )
          );

          assert(
            specifier.node.exportKind === "type",
            SyntaxErrorWithLoc.makeFromPosition(
              `Cannot export named exports from macro entry`,
              specifier.node.loc?.start
            )
          );
        }
      },
      ExportAllDeclaration(path) {
        if (
          !isImportMacrosName(path.node.source.value) ||
          path.node.exportKind === "type"
        ) {
          return;
        }

        throw SyntaxErrorWithLoc.makeFromPosition(
          "You can only reexport types from macro entry",
          path.node.loc?.start
        );
      },
      //#endregion exports validation
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
        const binding = path.scope.getBindingIdentifier(left.name);
        if (!binding) {
          return;
        }
        const flags = IdentFlagsHelper.get(state, binding);
        if (!flags) {
          return;
        }

        assert(
          flags & IdentFlags.STATE,
          SyntaxErrorWithLoc.makeFromPosition(
            `Cannot assign to a binded state`,
            path.node.loc?.start
          )
        );
        assert(
          flags & IdentFlags.LET,
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
      },
    },
  };
}
