type _JSXFunction = (
  type: React.ComponentType,
  props: Record<string, unknown>,
  key: React.Key,
  isStaticChildren: boolean,
  __source: unknown,
  __self: unknown
) => React.ElementType;
declare module "react/jsx-runtime" {
  export type JSXFunction = _JSXFunction;
  export const jsx: _JSXFunction;
  export const jsxs: _JSXFunction;
  export const Fragment: React.ComponentType;
}

declare module "react/jsx-dev-runtime" {
  export type JSXFunction = _JSXFunction;
  export const jsxDEV: _JSXFunction;

  export const Fragment: React.ComponentType;
}
