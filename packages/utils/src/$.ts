import {
  ReadonlySignal,
  Signal,
  computed,
  untracked,
} from "@preact-signals/unified-signals";
import { Accessor } from "./utils";

/**
 * Uncached is just accessor function in object wrapper, that allows to use it in JSX
 * and use `instanceof` to check if it is Uncached. Main difference with Signal is that you shouldn't follow rules of
 * hooks while creating it.
 * Example:
 * ```tsx
 * const sig = signal(1);
 *
 * <div>{$(() => sig.value * 10)}</div>
 * ```
 */
declare class Uncached<T> extends Signal<T> {
  constructor(accessor: Accessor<T>);
  get value(): T;
  peek(): T;
  valueOf(): T;
  toString(): string;
  /** @internal */
  _a(): T;
}

// @ts-expect-error
interface Uncached<T> extends JSX.Element {}

function Uncached<T>(this: Uncached<T>, accessor: Accessor<T>) {
  this._a = accessor;
}
Uncached.prototype = Object.create(Signal.prototype);
Object.defineProperties(Uncached.prototype, {
  value: {
    get(this: Uncached<any>) {
      return this._a();
    },
    set() {},
  },
  peek: {
    value(this: Uncached<any>) {
      return untracked(() => this._a());
    },
  },
  valueOf: {
    value(this: Uncached<any>) {
      return this._a();
    },
  },
  toString: {
    value(this: Uncached<any>) {
      return String(this._a());
    },
  },
});

/**
 * Uncached is just accessor function in object wrapper, that allows to use it in JSX
 * and use `instanceof` to check if it is Uncached. Main difference with Signal is that you shouldn't follow rules of
 * hooks while creating it.
 * Example:
 * ```tsx
 * const sig = signal(1);
 *
 * <div>{$(() => sig.value * 10)}</div>
 * ```
 *
 * Using with component wrapped in `withSignalProps`
 * ```tsx
 * const C = withSignalProps((props: { a: number }) => {
 *  return <div>{props.a}</div>;
 * });
 *
 * const sig = signal(1);
 *
 * <C a={$(() => sig.value)} />
 * ```
 */
export const $ = <T>(accessor: Accessor<T>): Uncached<T> =>
  new Uncached(accessor);

const computesCache = new WeakMap<Accessor<any>, ReadonlySignal<any>>();
export const signalOf$ = <T>($value: Uncached<T>): ReadonlySignal<T> =>
  computesCache.get($value._a) ??
  (computesCache.set($value._a, computed($value._a)),
  computesCache.get($value._a)!);

export { Uncached };
