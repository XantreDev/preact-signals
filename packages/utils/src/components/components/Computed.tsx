import { Accessor } from "@preact-signals/internal-utils";
import { useComputedOnce } from "../../hooks";
import { RenderResult } from "../type";

export type ComputedProps = {
  children: Accessor<RenderResult>;
};

export const Computed = ({ children }: ComputedProps): JSX.Element =>
  useComputedOnce(children).value as JSX.Element;
