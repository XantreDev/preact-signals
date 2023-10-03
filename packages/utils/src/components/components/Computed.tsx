import { useComputedOnce } from "../../hooks";
import { Accessor } from "../../utils";
import { RenderResult } from "../type";

export type ComputedProps = {
  children: Accessor<RenderResult>;
};

/**
 * @trackSignals
 */
export const Computed = ({ children }: ComputedProps): JSX.Element =>
  useComputedOnce(children).value as JSX.Element;
