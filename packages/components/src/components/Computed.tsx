import { useComputedOnce } from "@preact-signals/hooks";
import { Accessor } from "@preact-signals/utils";
import { RenderResult } from "../type";

export type ComputedProps = {
  children: Accessor<RenderResult>;
};

export const Computed = ({ children }: ComputedProps): JSX.Element =>
  useComputedOnce(children).value as JSX.Element;
