import { Accessor, AnyReactive, GetValue } from "./type";

export const accessorOfReactive = <T extends AnyReactive>(
  signalOrAccessor: AnyReactive
): Accessor<GetValue<T>> =>
  typeof signalOrAccessor === "function"
    ? signalOrAccessor
    : () => signalOrAccessor.value;

export const unwrapReactive = <T extends AnyReactive>(
  signalOrAccessor: T
): GetValue<T> =>
  typeof signalOrAccessor === "function"
    ? signalOrAccessor()
    : signalOrAccessor.value;
