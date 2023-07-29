import { useComputedOnce } from "../../hooks";
import { Accessor } from "../../utils";
import { RenderResult } from "../type";

export type ComputedProps = {
  children: Accessor<RenderResult>;
};

export const Computed = ({ children }: ComputedProps): JSX.Element =>
  useComputedOnce(children).value as JSX.Element;
