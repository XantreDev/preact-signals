import {
  ReadonlySignal,
  computed,
  untracked,
  useComputed,
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
declare class Uncached<T> {
  constructor(accessor: Accessor<T>);
  get value(): T;
  peek(): T;
  valueOf(): T;
  toString(): string;
  /** @internal */
  _accessor(): T;
}

interface Uncached<T> extends JSX.Element {}

const ReactElement = Symbol.for("react.element");

function Uncached<T>(this: Uncached<T>, accessor: Accessor<T>) {
  this._accessor = accessor;
}
Object.defineProperties(Uncached.prototype, {
  value: {
    get() {
      return this._accessor();
    },
  },
  peek: {
    value() {
      return untracked(() => this._accessor());
    },
  },
  valueOf: {
    value() {
      return this._accessor();
    },
  },
  toString: {
    value() {
      return String(this._accessor());
    },
  },
});

/**
 * @trackSignals
 * JSX bindings
 */
const RAccessorComponent = ({ data }: { data: Uncached<unknown> }) => {
  return useComputed(data._accessor).value;
};
Object.defineProperties(Uncached.prototype, {
  $$typeof: {
    value: ReactElement,
    configurable: true,
  },
  type: {
    value: RAccessorComponent,
    configurable: true,
  },
  props: {
    configurable: true,
    get() {
      return { data: this };
    },
  },
  ref: {
    configurable: true,
    value: null,
  },
  // __b is a way to make it working with preact
  __b: { configurable: true, value: 1 },
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
  computesCache.get($value._accessor) ??
  (computesCache.set($value._accessor, computed($value._accessor)),
  computesCache.get($value._accessor)!);

export { Uncached };
