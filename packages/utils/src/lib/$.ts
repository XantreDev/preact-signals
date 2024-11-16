import {
  ReadonlySignal,
  Signal,
  computed,
  untracked,
} from "@preact-signals/unified-signals";
import { Accessor } from "./utils";

const enum UncachedField {
  Accessor = "_a",
  Setter = "_s",
}

/**
 * ReactiveRef class extends Signal class and allows to use it in JSX.
 * Usually you don't need to use it directly, use `$` function instead.
 */
declare class ReactiveRef<T> extends Signal<T> {
  constructor(accessor: Accessor<T>);
  get value(): T;
  peek(): T;
  valueOf(): T;
  toString(): string;
  /** @internal */
  [UncachedField.Accessor](): T;
}

/**
 * WritableReactiveRef class extends ReactiveRef class and allows to use it in JSX.
 * Usually you don't need to use it directly, use `$w` function instead.
 */
declare class WritableReactiveRef<T> extends ReactiveRef<T> {
  set value(value: T);
  constructor(get: () => T, set: (value: T) => void);

  /** @internal */
  [UncachedField.Setter](value: T): void;
}

// @ts-expect-error
interface WritableReactiveRef<T> extends JSX.Element {}
// @ts-expect-error
interface ReactiveRef<T> extends JSX.Element {}

function ReactiveRef<T>(this: ReactiveRef<T>, accessor: Accessor<T>) {
  this[UncachedField.Accessor] = accessor;
}

export type WritableRefOptions<T> = {
  get(): T;
  set(value: T): void;
};
function WritableReactiveRef<T>(
  this: WritableReactiveRef<T>,
  get: () => T,
  set: (value: T) => void,
) {
  this[UncachedField.Accessor] = get;
  this[UncachedField.Setter] = set;
}
ReactiveRef.prototype = Object.create(Signal.prototype);
WritableReactiveRef.prototype = Object.create(ReactiveRef.prototype);

Object.defineProperties(ReactiveRef.prototype, {
  value: {
    get(this: ReactiveRef<any>) {
      return this[UncachedField.Accessor]();
    },
    set() {
      throw new Error("Uncached value is readonly");
    },
  },
  peek: {
    value(this: ReactiveRef<any>) {
      return untracked(() => this[UncachedField.Accessor]());
    },
  },
  valueOf: {
    value(this: ReactiveRef<any>) {
      return this[UncachedField.Accessor]();
    },
  },
  toString: {
    value(this: ReactiveRef<any>) {
      return String(this[UncachedField.Accessor]());
    },
  },
});

Object.defineProperty(WritableReactiveRef.prototype, "value", {
  get(this: WritableReactiveRef<any>) {
    return this[UncachedField.Accessor]();
  },
  set(this: WritableReactiveRef<any>, value: any) {
    this[UncachedField.Setter](value);
  },
});

/**
 * ReactiveRef is just accessor function in object wrapper, that allows to use it in JSX
 * and use `instanceof` to check if it is ReactiveRef. Main difference with Signal is that you shouldn't care about using hooks for it creation.
 * @example
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
export const $ = <T>(accessor: Accessor<T>): ReactiveRef<T> =>
  new ReactiveRef(accessor);

/**
 * @description `WritableReactiveRef` is accessor and setter function in object wrapper, that allows to use it in JSX.
 * @example
 * ```tsx
 * const sig = signal({
 *    a: [1,2,3]
 * });
 *
 * const ref = $w({
 *  get: () => sig.value["a"][0],
 *  set: (value) => sig.value = { ...sig.value, a: [value, ...sig.value["a"].slice(1)] }
 * });
 *
 * <div onClick={() => ref.value++}>{ref}</div>
 * ```
 *
 * `WritableReactiveRef` is also handy with deep reactivity tracking system
 * ```tsx
 * const sig = deepSignal({
 *   a: [1,2,3]
 * });
 *
 * // more efficient because it doesn't recreate object on each change
 * const ref = $w({
 *  get: () => sig.value["a"][0],
 *  set: (value) => sig.value["a"][0] = value
 * });
 * ```
 *
 * `WritableReactiveRef` can be used as prop with component wrapped in `withSignalProps`
 * ```tsx
 * const C = withSignalProps((props: { a: number }) => {
 *  return <div>{props.a}</div>;
 * });
 *
 * const sig = signal(1);
 * const ref = $w({
 *  get: () => sig.value,
 *  set(value) {
 *    sig.value = value;
 *  },
 * })
 *
 * <C a={ref} />
 * ```
 */
export const $w = <T>(options: WritableRefOptions<T>): WritableReactiveRef<T> =>
  new WritableReactiveRef(options.get, options.set);

const computesCache = new WeakMap<Accessor<any>, ReadonlySignal<any>>();
export const signalOf$ = <T>($value: ReactiveRef<T>): ReadonlySignal<T> =>
  computesCache.get($value[UncachedField.Accessor]) ??
  (computesCache.set(
    $value[UncachedField.Accessor],
    computed($value[UncachedField.Accessor]),
  ),
  computesCache.get($value[UncachedField.Accessor])!);

export {
  /**
   * @deprecated use `ReactiveRef`
   */
  ReactiveRef as Uncached,
  /**
   * @deprecated use `WritableReactiveRef`
   */
  WritableReactiveRef as WritableUncached,
  ReactiveRef,
  WritableReactiveRef,
};
