// this is small alteration of original transform to do not transform hooks
// https://github.com/preactjs/signals/blob/76babcb520594bb200fd69ac4840a7df5f259752/packages/react-transform/src/index.ts
import {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
  template,
} from "@babel/core";
import { isModule, addNamed } from "@babel/helper-module-imports";
import type { VisitNodeObject } from "@babel/traverse";
import debug from "debug";

interface PluginArgs {
  types: typeof BabelTypes;
  template: typeof BabelTemplate;
}

const optOutCommentIdentifier = /(^|\s)@noUseSignals(\s|$)/;
const optInCommentIdentifier = /(^|\s)@useSignals(\s|$)/;
const dataNamespace = "@preact-signals/safe-react/babel";
const defaultImportSource = "@preact-signals/safe-react/tracking";
const importName = "useSignals";
const getHookIdentifier = "getHookIdentifier";
const maybeUsesSignal = "maybeUsesSignal";
const containsJSX = "containsJSX";
const alreadyTransformed = "alreadyTransformed";

const logger = {
  transformed: debug("signals:react-transform:transformed"),
  skipped: debug("signals:react-transform:skipped"),
};

const get = (pass: PluginPass, name: any) =>
  pass.get(`${dataNamespace}/${name}`);
const set = (pass: PluginPass, name: string, v: any) =>
  pass.set(`${dataNamespace}/${name}`, v);

interface DataContainer {
  getData(name: string): any;
  setData(name: string, value: any): void;
}
const setData = (node: DataContainer, name: string, value: any) =>
  node.setData(`${dataNamespace}/${name}`, value);
const getData = (node: DataContainer, name: string) =>
  node.getData(`${dataNamespace}/${name}`);

function setOnFunctionScope(path: NodePath, key: string, value: any) {
  const functionScope = path.scope.getFunctionParent();
  if (functionScope) {
    setData(functionScope, key, value);
  }
}

type FunctionLike =
  | BabelTypes.ArrowFunctionExpression
  | BabelTypes.FunctionExpression
  | BabelTypes.FunctionDeclaration
  | BabelTypes.ObjectMethod;

/**
 * Simple "best effort" to get the base name of a file path. Not fool proof but
 * works in browsers and servers. Good enough for our purposes.
 */
function basename(filename: string | undefined): string | undefined {
  return filename?.split(/[\\/]/).pop();
}

const DefaultExportSymbol = Symbol("DefaultExportSymbol");

function getObjectPropertyKey(
  node: BabelTypes.ObjectProperty | BabelTypes.ObjectMethod
): string | null {
  if (node.key.type === "Identifier") {
    return node.key.name;
  } else if (node.key.type === "StringLiteral") {
    return node.key.value;
  }

  return null;
}
/**
 * If the function node has a name (i.e. is a function declaration with a
 * name), return that. Else return null.
 */
function getFunctionNodeName(path: NodePath<FunctionLike>): string | null {
  if (
    (path.node.type === "FunctionDeclaration" ||
      path.node.type === "FunctionExpression") &&
    path.node.id
  ) {
    return path.node.id.name;
  } else if (path.node.type === "ObjectMethod") {
    return getObjectPropertyKey(path.node);
  }

  return null;
}

/**
 * Given a function path's parent path, determine the "name" associated with the
 * function. If the function is an inline default export (e.g. `export default
 * () => {}`), returns a symbol indicating it is a default export. If the
 * function is an anonymous function wrapped in higher order functions (e.g.
 * memo(() => {})) we'll climb through the higher order functions to find the
 * name of the variable that the function is assigned to, if any. Other cases
 * handled too (see implementation). Else returns null.
 */
function getFunctionNameFromParent(
  parentPath: NodePath<BabelTypes.Node>
): string | null | typeof DefaultExportSymbol {
  if (
    parentPath.node.type === "VariableDeclarator" &&
    parentPath.node.id.type === "Identifier"
  ) {
    return parentPath.node.id.name;
  } else if (parentPath.node.type === "AssignmentExpression") {
    const left = parentPath.node.left;
    if (left.type === "Identifier") {
      return left.name;
    } else if (left.type === "MemberExpression") {
      let property = left.property;
      while (property.type === "MemberExpression") {
        property = property.property;
      }

      if (property.type === "Identifier") {
        return property.name;
      } else if (property.type === "StringLiteral") {
        return property.value;
      }

      return null;
    } else {
      return null;
    }
  } else if (parentPath.node.type === "ObjectProperty") {
    return getObjectPropertyKey(parentPath.node);
  } else if (parentPath.node.type === "ExportDefaultDeclaration") {
    return DefaultExportSymbol;
  } else if (
    parentPath.node.type === "CallExpression" &&
    parentPath.parentPath != null
  ) {
    // If our parent is a Call Expression, then this function expression is
    // wrapped in some higher order functions. Recurse through the higher order
    // functions to determine if this expression is assigned to a name we can
    // use as the function name
    return getFunctionNameFromParent(parentPath.parentPath);
  } else {
    return null;
  }
}

/* Determine the name of a function */
function getFunctionName(
  path: NodePath<FunctionLike>
): string | typeof DefaultExportSymbol | null {
  let nodeName = getFunctionNodeName(path);
  if (nodeName) {
    return nodeName;
  }

  return getFunctionNameFromParent(path.parentPath);
}

function isComponentName(name: string | null): boolean {
  return name?.match(/^[A-Z]/) != null ?? false;
}

function hasLeadingComment(path: NodePath, comment: RegExp): boolean {
  const comments = path.node.leadingComments;
  return comments?.some((c) => c.value.match(comment) !== null) ?? false;
}

function hasLeadingOptInComment(path: NodePath) {
  return hasLeadingComment(path, optInCommentIdentifier);
}

function hasLeadingOptOutComment(path: NodePath) {
  return hasLeadingComment(path, optOutCommentIdentifier);
}

function isOptedIntoSignalTracking(path: NodePath | null): boolean {
  if (!path) return false;

  switch (path.node.type) {
    case "ArrowFunctionExpression":
    case "FunctionExpression":
    case "FunctionDeclaration":
    case "ObjectMethod":
    case "ObjectExpression":
    case "VariableDeclarator":
    case "VariableDeclaration":
    case "AssignmentExpression":
    case "CallExpression":
      return (
        hasLeadingOptInComment(path) ||
        isOptedIntoSignalTracking(path.parentPath)
      );
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
    case "ObjectProperty":
    case "ExpressionStatement":
      return hasLeadingOptInComment(path);
    default:
      return false;
  }
}

function isOptedOutOfSignalTracking(path: NodePath | null): boolean {
  if (!path) return false;

  switch (path.node.type) {
    case "ArrowFunctionExpression":
    case "FunctionExpression":
    case "FunctionDeclaration":
    case "ObjectMethod":
    case "ObjectExpression":
    case "VariableDeclarator":
    case "VariableDeclaration":
    case "AssignmentExpression":
    case "CallExpression":
      return (
        hasLeadingOptOutComment(path) ||
        isOptedOutOfSignalTracking(path.parentPath)
      );
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
    case "ObjectProperty":
    case "ExpressionStatement":
      return hasLeadingOptOutComment(path);
    default:
      return false;
  }
}

function isComponentFunction(
  path: NodePath<FunctionLike>,
  functionName: string | null
): boolean {
  return (
    getData(path.scope, containsJSX) === true && // Function contains JSX
    isComponentName(functionName) // Function name indicates it's a component
  );
}

function shouldTransform(
  path: NodePath<FunctionLike>,
  functionName: string | null,
  options: PluginOptions
): boolean {
  // Opt-out takes first precedence
  if (isOptedOutOfSignalTracking(path)) return false;
  // Opt-in opts in to transformation regardless of mode
  if (isOptedIntoSignalTracking(path)) return true;

  if (options.mode === "all") {
    return isComponentFunction(path, functionName);
  }

  if (options.mode == null || options.mode === "auto") {
    return (
      getData(path.scope, maybeUsesSignal) === true && // Function appears to use signals;
      isComponentFunction(path, functionName)
    );
  }

  return false;
}

function isValueMemberExpression(
  path: NodePath<BabelTypes.MemberExpression>
): boolean {
  return (
    (path.node.property.type === "Identifier" &&
      path.node.property.name === "value") ||
    (path.node.property.type === "StringLiteral" &&
      path.node.property.value === "value")
  );
}

const tryCatchTemplate = template.statements`var STORE_IDENTIFIER = HOOK_IDENTIFIER();
try {
	BODY
} finally {
	STORE_IDENTIFIER.f();
}`;

function wrapInTryFinally(
  t: typeof BabelTypes,
  path: NodePath<FunctionLike>,
  state: PluginPass
): FunctionLike {
  const stopTrackingIdentifier = path.scope.generateUidIdentifier("effect");

  const newFunction = t.cloneNode(path.node);
  newFunction.body = t.blockStatement(
    tryCatchTemplate({
      STORE_IDENTIFIER: stopTrackingIdentifier,
      HOOK_IDENTIFIER: get(state, getHookIdentifier)(),
      BODY: t.isBlockStatement(path.node.body)
        ? path.node.body.body // TODO: Is it okay to elide the block statement here?
        : t.returnStatement(path.node.body),
    })
  );

  return newFunction;
}

function transformFunction(
  t: typeof BabelTypes,
  options: PluginOptions,
  path: NodePath<FunctionLike>,
  functionName: string | null,
  state: PluginPass
) {
  const newFunction: FunctionLike = wrapInTryFinally(t, path, state);
  // if (isCustomHook(functionName) || options.experimental?.noTryFinally) {
  //   // For custom hooks, we don't need to wrap the function body in a
  //   // try/finally block because later code in the function's render body could
  //   // read signals and we want to track and associate those signals with this
  //   // component. The try/finally in the component's body will stop tracking
  //   // signals for us instead.
  //   newFunction = prependUseSignals(t, path, state);
  // } else {
  // }

  // Using replaceWith keeps the existing leading comments already so
  // we'll clear our cloned node's leading comments to ensure they
  // aren't duplicated in the output.
  newFunction.leadingComments = newFunction.leadingComments?.filter(
    (c) =>
      !c.value.match(optOutCommentIdentifier) &&
      !c.value.match(optInCommentIdentifier)
  );

  setData(path, alreadyTransformed, true);
  path.replaceWith(newFunction);
}

function createImportLazily(
  t: typeof BabelTypes,
  pass: PluginPass,
  path: NodePath<BabelTypes.Program>,
  importName: string,
  source: string
): () => BabelTypes.Identifier | BabelTypes.MemberExpression {
  return () => {
    if (isModule(path)) {
      let reference: BabelTypes.Identifier = get(pass, `imports/${importName}`);
      if (reference) return t.cloneNode(reference);
      /* const direcitves: BabelTypes.Statement[] = [];
      for (let statement of path.get("body")) {
        if (statement.isStringLiteral()) {
          direcitves.push(statement.node);
        }
      } */
      reference = addNamed(path, importName, source, {
        importedInterop: "uncompiled",
        importPosition: "after",
      });
      set(pass, `imports/${importName}`, reference);

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
      let reference = get(pass, `requires/${importName}`);
      if (reference) {
        reference = t.cloneNode(reference);
      } else {
        reference = addNamed(path, importName, source, {
          importedInterop: "uncompiled",
        });
        set(pass, `requires/${importName}`, reference);
      }

      return reference;
    }
  };
}

export interface PluginOptions {
  /**
   * Specify the mode to use:
   * - `auto`: Automatically wrap all components that use signals.
   * - `manual`: Only wrap components that are annotated with `@useSignals` in a JSX comment.
   * - `all`: Makes all components reactive to signals.
   *   @default "all"
   */
  mode?: "auto" | "manual" | "all";
  /** Specify a custom package to import the `useSignals` hook from.
   * @default "@preact-signals/safe-react/tracking"
   */
  importSource?: string;
  experimental?: {
    // apliable only to swc plugin
    addHookUsageFlag?: boolean;
  };
}

function log(
  transformed: boolean,
  path: NodePath<FunctionLike>,
  functionName: string | null,
  currentFile: string | undefined
) {
  if (!logger.transformed.enabled && !logger.skipped.enabled) return;

  let cwd = "";
  if (typeof process !== undefined && typeof process.cwd == "function") {
    cwd = process.cwd().replace(/\\([^ ])/g, "/$1");
    cwd = cwd.endsWith("/") ? cwd : cwd + "/";
  }

  const relativePath = currentFile?.replace(cwd, "") ?? "";
  const lineNum = path.node.loc?.start.line;
  functionName = functionName ?? "<anonymous>";

  if (transformed) {
    logger.transformed(`${functionName} (${relativePath}:${lineNum})`);
  } else {
    logger.skipped(`${functionName} (${relativePath}:${lineNum}) %o`, {
      hasSignals: getData(path.scope, maybeUsesSignal) ?? false,
      hasJSX: getData(path.scope, containsJSX) ?? false,
    });
  }
}

function isComponentLike(
  path: NodePath<FunctionLike>,
  functionName: string | null
): boolean {
  return !getData(path, alreadyTransformed) && isComponentName(functionName);
}

export default function signalsTransform(
  { types: t }: PluginArgs,
  options: PluginOptions
): PluginObj {
  options.mode ??= "all";
  // TODO: Consider alternate implementation, where on enter of a function
  // expression, we run our own manual scan the AST to determine if the
  // function uses signals and is a component. This manual scan once upon
  // seeing a function would probably be faster than running an entire
  // babel pass with plugins on components twice.
  const visitFunction: VisitNodeObject<PluginPass, FunctionLike> = {
    exit(path, state) {
      if (getData(path, alreadyTransformed) === true) return false;

      let functionName = getFunctionName(path);
      if (functionName === DefaultExportSymbol) {
        functionName = basename(this.filename) ?? null;
      }

      if (shouldTransform(path, functionName, state.opts)) {
        transformFunction(t, state.opts, path, functionName, state);
        log(true, path, functionName, this.filename);
      } else if (isComponentLike(path, functionName)) {
        log(false, path, functionName, this.filename);
      }
    },
  };

  return {
    name: dataNamespace,
    visitor: {
      Program: {
        enter(path, state) {
          // Following the pattern of babel-plugin-transform-react-jsx, we
          // lazily create the import statement for the useSignalTracking hook.
          // We create a function and store it in the PluginPass object, so that
          // on the first usage of the hook, we can create the import statement.
          set(
            state,
            getHookIdentifier,
            createImportLazily(
              t,
              state,
              path,
              importName,
              options.importSource ?? defaultImportSource
            )
          );
        },
      },

      ArrowFunctionExpression: visitFunction,
      FunctionExpression: visitFunction,
      FunctionDeclaration: visitFunction,
      ObjectMethod: visitFunction,

      MemberExpression(path) {
        if (isValueMemberExpression(path)) {
          setOnFunctionScope(path, maybeUsesSignal, true);
        }
      },

      JSXElement(path) {
        setOnFunctionScope(path, containsJSX, true);
      },
      JSXFragment(path) {
        setOnFunctionScope(path, containsJSX, true);
      },
    },
  };
}
