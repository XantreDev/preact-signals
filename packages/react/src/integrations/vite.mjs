// @ts-check
import escapeStringRegexp from "regex-escape";
import { createRequire } from "node:module";
import path from "node:path";
import babel from "vite-plugin-babel";

const require = createRequire(import.meta.url);
/**
 *
 * @returns {import('vite').Alias}
 */
export const createReactAlias = () => {
  return {
    find: /^react$/,
    replacement: "@preact-signals/safe-react/react",
    customResolver(source, importer) {
      if (!importer) {
        return require.resolve(source);
      }
      return path.normalize(importer) ===
        require.resolve("@preact-signals/safe-react/react")
        ? require.resolve("react")
        : require.resolve("@preact-signals/safe-react/react");
    },
  };
};

/**
 * @typedef {(string | { type: 'nested', path: string[] })} Dep
 */

/**
 *
 * @param {string} dep
 * @param {string} from
 * @returns
 */
const resolvePackageFrom = (dep, from) =>
  path.dirname(
    require.resolve(`${dep}/package.json`, {
      paths: [from],
    })
  );

/**
 *
 * @param {Dep} dep
 */
const resolveDepFolder = (dep) => {
  if (typeof dep === "string") {
    return resolvePackageFrom(dep, process.cwd());
  }

  if (dep.path.length === 0) {
    throw new Error("Invalid dep of length 0");
  }
  return dep.path.reduce(
    (from, cur) => resolvePackageFrom(cur, from),
    process.cwd()
  );
};

/**
 *
 * @param {string[]} paths
 * @returns
 */
const toPosix = (paths) =>
  process.platform === "win32"
    ? paths.map((it) => it.replace(path.win32.sep, path.posix.sep))
    : [];

/**
 *
 * @param {Dep[]} deps package names
 * @returns {import('vite').Plugin}
 */
export const transformDepPlugin = (deps) => {
  if (!Array.isArray(deps)) {
    throw new Error("deps must be an array");
  }
  const depsPaths = deps.map(resolveDepFolder).map(path.posix.normalize);

  const depsRegex = [
    ...depsPaths,
    toPosix(depsPaths),
    ...deps
      .map((it) => (typeof it === "string" ? it : it.path.at(-1)))
      .filter(Boolean),
  ]
    // @ts-expect-error Boolean filter...
    .map(escapeStringRegexp)
    .join("|");

  const filter = new RegExp(depsRegex);
  return babel({
    babelConfig: {
      plugins: [
        "@babel/plugin-syntax-jsx",
        "module:@preact-signals/safe-react/babel",
      ],
    },
    filter,
    loader: "tsx",
  });
};
