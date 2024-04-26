import { Signal, untracked } from "@preact-signals/unified-signals";
import { IfNever } from "type-fest";

declare class ReducerSignal<T, TAction> extends Signal<T> {
  constructor(value: T, reducer: Reducer<T, TAction>);
  dispatch(...args: IfNever<TAction, [], [payload: TAction]>): void;
  /** @internal */
  _r: Reducer<T, TAction>;
}

export type Reducer<T, TAction> = (state: T, action: TAction) => T;

function reducerSignalDispatcher<T, TAction>(
  this: ReducerSignal<T, TAction>,
  action: TAction
) {
  this.value = untracked(() => this._r(this.peek(), action));
}

function ReducerSignal<T, TAction>(
  this: ReducerSignal<T, TAction>,
  value: T,
  reducer: Reducer<T, TAction>
) {
  Signal.call(this, value);
  this._r = reducer;
  // allowing to extract Dispatch
  // @ts-expect-error
  this.dispatch = reducerSignalDispatcher.bind(this);
}
ReducerSignal.prototype = Object.create(Signal.prototype);

export { ReducerSignal };

export const reducerSignal = <T, TAction = never>(
  value: T,
  reducer: Reducer<T, TAction>
): ReducerSignal<T, TAction> => new ReducerSignal(value, reducer);
