export type JSXFunction = (
  type: React.ComponentType,
  props: Record<string, unknown>,
  key: React.Key,
  isStaticChildren: boolean,
  __source: unknown,
  __self: unknown
) => React.ElementType;

export declare namespace ReactJSX {
  export const jsx: JSXFunction;
  export const jsxs: JSXFunction;
  export const Fragment: React.ComponentType;
  export type { JSXFunction };
}

export declare namespace ReactJSXDev {
  export const jsxDEV: JSXFunction;
  export const Fragment: React.ComponentType;
  export type { JSXFunction };
}
