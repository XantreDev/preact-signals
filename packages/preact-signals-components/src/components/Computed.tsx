import { Accessor } from "@preact-signals/utils";
import { RenderResult } from "../type";

export type ComputedProps = {
  children: Accessor<RenderResult>;
};

export const Computed = ({ children }: ComputedProps): RenderResult =>
  children();
