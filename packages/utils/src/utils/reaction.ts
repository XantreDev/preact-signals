import {
  batch,
  computed,
  effect,
  untracked,
} from "@preact-signals/unified-signals";
import { accessorOfSignal } from "./getter";

type Dispose = () => void;
export type ReactionOptions = Partial<
  | {
      /**
       * @default
       */
      memoize: false;
    }
  | {
      memoize: true;
    }
>;

// const isObject = <T>(obj: T): obj is Extract<T, object> =>
//   !!obj && typeof obj === "object";

// this implementation is ok, but i will wait real one
// const parentProp = Symbol("parent-prop");
// class Handler implements ProxyHandler<any> {
//   constructor(private parent: any) {}
//   get() {
//     if (arguments[0] === parentProp) {
//       return this.parent;
//     }
//     // @ts-expect-error
//     return Reflect.get(...arguments);
//   }
// }

// const referenceUniqueObject = (() => {
//   const parentToSonMap = new WeakMap<any, any>();
//   return (obj: object) => {
//     // @ts-expect-error
//     const parent = obj[parentProp];
//     if (parent) {
//       return parent;
//     }

//     if (parentToSonMap.has(obj)) {
//       return parentToSonMap.get(obj)!;
//     }

//     return parentToSonMap.set(obj, new Proxy(obj, new Handler(obj))).get(obj)!;
//   };
// })();

// const computeNoInit = Symbol("compute.no.init");
// /**
//  *
//  * @param compute
//  * @param options compare function can cause additional computation if always returns false, only in case of objects
//  * @returns
//  */
// const computedEqual = <T>(
//   compute: () => T,
//   options: { equals?: (prev: T, next: T) => boolean } = EMPTY_OBJECT
// ) => {
//   if (!options?.equals) {
//     return computed(compute);
//   }
//   let prev: typeof computeNoInit | T = computeNoInit;
//   return computed(() => {
//     const next = compute();
//     if (prev === computeNoInit) {
//       prev = next;
//       return next;
//     }

//     const isCustomEquals = options.equals!(prev, next);
//     if (isCustomEquals) {
//       return prev;
//     }
//     if (!Object.is(prev, next)) {
//       prev = next;
//       return prev;
//     }
//     if (isObject(prev)) {
//       prev = referenceUniqueObject(prev);
//       return prev;
//     }

//     return prev;
//   });
// };

/**
 * Reaction dispose callback, that executes when deps function is rotten
 */
type ReactionDispose = () => void;

/**
 * Creates a reactive effect that runs the given function whenever any of the dependencies change.
 *
 * `reaction` is enhanced version of this:
 * ```ts
 * effect(() => {
 *  const value = deps();
 *  untracked(() => fn(value));
 * });
 * ```
 *
 * @param deps A function that returns the dependencies for the effect.
 * @param fn A function that runs the effect. It receives the dependencies and an options object with a `isFirst` property that is `true` on the first run of the effect.
 * @param options A options object that contains `memoize` prop that tells should deps function result be memoized
 * @returns A function that can be called to dispose of the effect.
 */
export const reaction = <T>(
  deps: () => T,
  fn: (dep: T, options: { isFirst: boolean }) => void | ReactionDispose,
  options?: ReactionOptions
): Dispose => {
  let isFirst = true;
  const wrappedDeps = options?.memoize
    ? accessorOfSignal(computed(deps))
    : deps;

  return effect(() => {
    const value = wrappedDeps();

    try {
      return untracked(() => fn(value, { isFirst }));
    } finally {
      isFirst = false;
    }
  });
};

let rafsItems: (() => void)[] = [];
const executor = () => {
  isRafScheduled = false;
  const items = rafsItems;
  rafsItems = [];
  batch(() => {
    items.forEach((item) => item());
  });
};
let isRafScheduled = false;

/**
 * Creates a reactive effect that runs the given function whenever any of the dependencies change **in requestAnimationFrame**.
 *
 *
 * @param deps A function that returns the dependencies for the effect.
 * @param fn A function that runs after deps changes in next requestAnimationFrame. It receives the dependencies and an options object with a `isFirst` property that is `true` on the first run of the effect.
 * @param options A options object that contains `memoize` prop that tells should deps function result be memoized
 * @returns A function that can be called to dispose of the effect.
 */
export const rafReaction = <T>(
  deps: () => T,
  fn: (dep: T, options: { isFirst: boolean }) => void,
  options?: ReactionOptions
): Dispose => {
  let isFirst = true;
  const wrappedDeps = options?.memoize
    ? accessorOfSignal(computed(deps))
    : deps;
  let isSelfRafScheduled = false;

  return effect(() => {
    const value = wrappedDeps();

    try {
      if (!isRafScheduled) {
        isRafScheduled = true;
        requestAnimationFrame(executor);
      }
      if (!isSelfRafScheduled) {
        const _isFirst = isFirst;
        isSelfRafScheduled = true;
        rafsItems.push(() => {
          isSelfRafScheduled = false;
          fn(value, { isFirst: _isFirst });
        });
      }
    } finally {
      isFirst = false;
    }
  });
};
