// @ts-check
import fastGlob from "fast-glob";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { resolve } from "node:path";

const { glob } = fastGlob;

const CHECK_FIELDS = ["main", "react-native", "types"];
/**
 * @type {string[]}
 */
const allowNoTypes = [];

const packageJson = await glob("**/package.json", {
  ignore: ["**/node_modules/**", "**/dist/**"],
});

/**
 * @type {string[]}
 */
const errors = [];
await Promise.allSettled(
  packageJson.map(async (path) => {
    const pkg = JSON.parse(await fs.readFile(path, "utf8"));
    const directoryPath = resolve(path, "..");

    for (const field of CHECK_FIELDS) {
      if (field === "types" && allowNoTypes.some((it) => path.includes(it))) {
        console.log("skipped types for :", path);
        continue;
      }
      const fieldValue = pkg[field];
      if (!fieldValue) {
        errors.push(`Missing ${field} in ${path}`);
        continue;
      }
      if (typeof fieldValue !== "string") {
        errors.push(
          `Invalid ${field} in ${path}; must be a string. But ${fieldValue} is a ${typeof fieldValue}`
        );
        continue;
      }

      const isRelative = fieldValue.startsWith(".");
      if (!isRelative) {
        errors.push(
          `Invalid ${field} in ${path}; '${fieldValue}' must be a relative path`
        );
        continue;
      }

      if (!existsSync(resolve(directoryPath, fieldValue))) {
        errors.push(
          `Invalid ${field} in ${path}; '${fieldValue}' does not exist`
        );
      }
    }
  })
);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
