import { effect, untracked } from "@preact-signals/unified-signals";

type Dispose = () => void;
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
 * @returns A function that can be called to dispose of the effect.
 */
export const reaction = <T>(
  deps: () => T,
  fn: (dep: T, options: { isFirst: boolean }) => void
): Dispose => {
  let isFirst = true;
  return effect(() => {
    const value = deps();

    untracked(() => fn(value, { isFirst }));
    isFirst = false;
  });
};
