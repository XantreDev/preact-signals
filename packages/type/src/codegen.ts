import { readFile } from "fs/promises";
import CONFIG from "./config.json";

const applyTypeToInterface = (type: string, interfaceText: string) => {
  const declarationLines = interfaceText.split("\n");
  const startLine = declarationLines[0];
  const endLine = declarationLines[declarationLines.length - 1];
  const elements = declarationLines.slice(1, declarationLines.length - 1);
  return [
    startLine,
    ...elements.map((line) => {
      const parts = line.split(":");
      if (parts.length !== 2) {
        throw new Error("Could not find declaration");
      }

      const [name, _declaration] = parts;
      if (!_declaration) {
        throw new Error("Could not find declaration");
      }
      const declaration = _declaration.replace(/;$/, "").trim();
      return `${name}: ${type}<${declaration}>;`;
    }),
    endLine,
  ].join("\n");
};

const getInterfaceDeclaration = (interfaceName: string, text: string) => {
  const interfaceDeclaration = text.match(
    new RegExp(`interface ${interfaceName}\\s*{([\\s\\S]*?)}`, "g")
  );
  if (!interfaceDeclaration) {
    throw new Error(`Could not find ${interfaceName} declaration`);
  }
  return interfaceDeclaration[0];
};

const getComponentInterfaces = (reactTypings: string) => {
  const { apply, interfaces, module } = CONFIG.componentInterfaces;
  const resultInterfaces = interfaces.map((interfaceName) => {
    const interfaceText = getInterfaceDeclaration(interfaceName, reactTypings);
    const typeText = applyTypeToInterface(apply, interfaceText);
    return typeText;
  });

  return [`declare module '${module}' {`, ...resultInterfaces, "}"].join("\n");
};

void (async () => {
  const reactTypes = await readFile(
    "node_modules/@types/react/index.d.ts",
    "utf8"
  );

  const componentInterfaces = getComponentInterfaces(reactTypes);

  // console.log(
  //   new Set([...reactTypes.matchAll(/(\w)+?Attributes/g)].map((m) => m[0]))
  // );
})();
