import { Signal, untracked } from "@preact-signals/unified-signals";
import { IfNever } from "type-fest";

declare class ReducerSignal<T, TAction = never> extends Signal<T> {
  constructor(value: T, reducer: Reducer<T, TAction>);
  /**
   *
   * dispatch is automatically binds to signals, so you can destructure it
   * @param args
   */
  dispatch: (...args: IfNever<TAction, [], [payload: TAction]>) => void;
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

function ReducerSignal<T, TAction = never>(
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

/**
 *
 * @description implementation of Reducer pattern for signals
 * @example
 * ```tsx
 * const reducer = (it: number, action: { type: 'increment' | 'decrement' }) => {
 *   switch (action.type) {
 *    case 'increment':
 *     return it + 1
 *    case 'decrement':
 *     return it - 1
 *   }
 * }
 *
 * const counter = reducerSignal(0, reducer)
 *
 * effect(() => {
 *   console.log('counter value', counter.value)
 * })
 * // prints 1
 * counter.dispatch({ type: 'increment' })
 *
 * // dispatch can be destructured, other parameters not
 * const { dispatch } = reducerSignal
 * // prints 2
 * dispatch({ type: 'increment' })
 * ```
 *
 * @param value initialState
 * @param reducer reducer function (do not track reactive dependencies)
 * @returns
 */
export const reducerSignal = /*#__NO_SIDE_EFFECTS__*/ <T, TAction = never>(
  value: T,
  reducer: Reducer<T, TAction>
): ReducerSignal<T, TAction> => new ReducerSignal(value, reducer);
