import type { FC } from "react";
import { wrapToOneRender } from "./oneRenderParent";
import { scopedHooksChild } from "./scopedHooks";

export const withOneRender = <Props,>(Component: React.FC<Props>) => {
  const ChildComponent = scopedHooksChild(Component);

  const { Wrapper } = wrapToOneRender(ChildComponent);

  return Wrapper as any as FC<Props>;
};
