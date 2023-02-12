import type { FC } from "react";
import { wrapToOneRender } from "./oneRenderParent";
import { scopedHooksChild } from "./scopedHooks";
import { SignalifyObject } from "./types";

export const withOneRender = <Props = Record<string, never>,>(
  Component: React.FC<Props>
) => {
  const ChildComponent = scopedHooksChild(Component);

  const { Wrapper } = wrapToOneRender(ChildComponent);

  return Wrapper as any as FC<SignalifyObject<Props>>;
};
