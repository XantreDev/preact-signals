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
  [UncachedField.Accessor](): T;
}

declare class WritableUncached<T> extends Uncached<T> {
  set value(value: T);
  constructor(options: WritableUncachedOptions<T>);
  [UncachedField.Setter](value: T): void;
}

// @ts-expect-error
interface WritableUncached<T> extends JSX.Element {}
// @ts-expect-error
interface Uncached<T> extends JSX.Element {}

function Uncached<T>(this: Uncached<T>, accessor: Accessor<T>) {
  this[UncachedField.Accessor] = accessor;
}

export type WritableUncachedOptions<T> = {
  get(): T;
  set(value: T): void;
};
function WritableUncached<T>(
  this: WritableUncached<T>,
  options: WritableUncachedOptions<T>
) {
  this[UncachedField.Accessor] = options.get;
  this[UncachedField.Setter] = options.set;
}
Uncached.prototype = Object.create(Signal.prototype);
WritableUncached.prototype = Object.create(Uncached.prototype);

Object.defineProperties(Uncached.prototype, {
  value: {
    get(this: Uncached<any>) {
      return this[UncachedField.Accessor]();
    },
    set() {
      throw new Error("Uncached value is readonly");
    },
  },
  peek: {
    value(this: Uncached<any>) {
      return untracked(() => this[UncachedField.Accessor]());
    },
  },
  valueOf: {
    value(this: Uncached<any>) {
      return this[UncachedField.Accessor]();
    },
  },
  toString: {
    value(this: Uncached<any>) {
      return String(this[UncachedField.Accessor]());
    },
  },
});

Object.defineProperty(WritableUncached.prototype, "value", {
  get(this: WritableUncached<any>) {
    return this[UncachedField.Accessor]();
  },
  set(this: WritableUncached<any>, value: any) {
    this[UncachedField.Setter](value);
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

export const $w = <T>(
  options: WritableUncachedOptions<T>
): WritableUncached<T> => new WritableUncached(options);

const computesCache = new WeakMap<Accessor<any>, ReadonlySignal<any>>();
export const signalOf$ = <T>($value: Uncached<T>): ReadonlySignal<T> =>
  computesCache.get($value[UncachedField.Accessor]) ??
  (computesCache.set(
    $value[UncachedField.Accessor],
    computed($value[UncachedField.Accessor])
  ),
  computesCache.get($value[UncachedField.Accessor])!);

export { Uncached, WritableUncached };
