import { Accessor } from "../../utils";
import { RenderResult } from "../type";

export type ComputedProps = {
  children: Accessor<RenderResult>;
};

/**
 * @useSignals
 */
export const Computed = ({ children }: ComputedProps): JSX.Element =>
  children() as JSX.Element;
