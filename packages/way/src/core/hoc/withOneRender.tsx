import type { FC } from "react";
import { Simplify } from "type-fest";
import { wrapToOneRender } from "./oneRenderParent";
import { scopedHooksChild } from "./scopedHooks";
import { SignalifyObject } from "./types";

export const withOneRender = <Props extends object = Record<string, never>>(
  Component: React.FC<SignalifyObject<Props>>
) => {
  const ChildComponent = scopedHooksChild(Component);

  const { Wrapper } = wrapToOneRender(ChildComponent);

  return Wrapper as any as FC<Simplify<SignalifyObject<Props> | Props>>;
};
