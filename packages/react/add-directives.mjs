// @ts-check
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dirents = await Promise.all([
  readdir(resolve(__dirname, "./dist/cjs"), {
    recursive: true,
    withFileTypes: true,
  }),
  readdir(resolve(__dirname, "./dist/esm"), {
    recursive: true,
    withFileTypes: true,
  }),
]).then(([a, b]) => a.concat(b));

const reactRegex = /['"]react['"]/;

/**
 * @type {string[]}
 */
const overwrittenPaths = [];
/**
 *
 * @param {import("node:fs").Dirent} dirent
 */
const processFile = async (dirent) => {
  const path = resolve(dirent.parentPath, dirent.name);
  const data = await readFile(path, "utf-8");

  if (data.match(reactRegex)) {
    await writeFile(path, '"use client";\n' + data, "utf-8");
    overwrittenPaths.push(path);
  }
};
/**
 * @type {Promise<void>[]}
 */
const promises = [];
for (let i = 0; i < dirents.length; ++i) {
  const dirent = dirents[i];
  if (
    dirent &&
    dirent.isFile() &&
    (dirent.name.endsWith(".cjs") || dirent.name.endsWith(".mjs"))
  ) {
    promises.push(processFile(dirent));
  }
}

await Promise.all(promises);

console.log(
  "added 'use client'; directive for:",
  overwrittenPaths.map((it) => relative(__dirname, it)).join(", "),
);
