import { signal, computed, effect, Signal } from "@preact/signals-core";
import { useRef, useMemo, useEffect } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

const Empty = [] as const;
const ReactElemType = Symbol.for("react.element"); // https://github.com/facebook/react/blob/346c7d4c43a0717302d446da9e7423a8e28d8996/packages/shared/ReactSymbols.js#L15

const symDispose: unique symbol =
  (Symbol as any).dispose || Symbol.for("Symbol.dispose");

// this is effect before mangling, since we are not in preact signals repo, we should use mangled props
// interface Effect {
//   _sources: object | undefined;
//   _start(): () => void;
//   _callback(): void;
//   _dispose(): void;
// }
interface Effect {
  _sources: object | undefined;
  S(): () => void;
  c(): void;
  d(): void;
}

export interface EffectStore {
  effect: Effect;
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): number;
  /** finishEffect - stop tracking the signals used in this component */
  f(): void;
  [symDispose](): void;
}

let finishUpdate: (() => void) | undefined;

function setCurrentStore(store?: EffectStore) {
  // end tracking for the current update:
  if (finishUpdate) finishUpdate();
  // start tracking the new update:
  finishUpdate = store && store.effect.S();
}

const clearCurrentStore = () => setCurrentStore();

/**
 * A redux-like store whose store value is a positive 32bit integer (a 'version').
 *
 * React subscribes to this store and gets a snapshot of the current 'version',
 * whenever the 'version' changes, we tell React it's time to update the component (call 'onStoreChange').
 *
 * How we achieve this is by creating a binding with an 'effect', when the `effect._callback' is called,
 * we update our store version and tell React to re-render the component ([1] We don't really care when/how React does it).
 *
 * [1]
 * @see https://react.dev/reference/react/useSyncExternalStore
 * @see https://github.com/reactjs/rfcs/blob/main/text/0214-use-sync-external-store.md
 */
function createEffectStore(): EffectStore {
  let effectInstance!: Effect;
  let version = 0;
  let onChangeNotifyReact: (() => void) | undefined;

  let unsubscribe = effect(function (this: Effect) {
    effectInstance = this;
  });
  effectInstance.c = function () {
    version = (version + 1) | 0;
    if (onChangeNotifyReact) onChangeNotifyReact();
  };

  return {
    effect: effectInstance,
    subscribe(onStoreChange) {
      onChangeNotifyReact = onStoreChange;

      return function () {
        /**
         * Rotate to next version when unsubscribing to ensure that components are re-run
         * when subscribing again.
         *
         * In StrictMode, 'memo'-ed components seem to keep a stale snapshot version, so
         * don't re-run after subscribing again if the version is the same as last time.
         *
         * Because we unsubscribe from the effect, the version may not change. We simply
         * set a new initial version in case of stale snapshots here.
         */
        version = (version + 1) | 0;
        onChangeNotifyReact = undefined;
        unsubscribe();
      };
    },
    getSnapshot() {
      return version;
    },
    f() {
      clearCurrentStore();
    },
    [symDispose]() {
      clearCurrentStore();
    },
  };
}

let finalCleanup: Promise<void> | undefined;
const _queueMicroTask = Promise.prototype.then.bind(Promise.resolve());

/**
 * @description this hook is for `@preact/signals-react-transform`
 * Custom hook to create the effect to track signals used during render and
 * subscribe to changes to rerender the component when the signals change.
 */
export function useSignals(): EffectStore {
  clearCurrentStore();
  if (!finalCleanup) {
    finalCleanup = _queueMicroTask(() => {
      finalCleanup = undefined;
      clearCurrentStore();
    });
  }

  const storeRef = useRef<EffectStore>();
  if (storeRef.current == null) {
    storeRef.current = createEffectStore();
  }

  const store = storeRef.current;
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  setCurrentStore(store);

  return store;
}

/**
 * A wrapper component that renders a Signal's value directly as a Text node or JSX.
 */
function SignalValue(props: { data: Signal }) {
  const effectStore = useSignals();
  try {
    return props.data.value;
  } finally {
    effectStore.f();
  }
}

// Decorate Signals so React renders them as <SignalValue> components.
Object.defineProperties(Signal.prototype, {
  $$typeof: { configurable: true, value: ReactElemType },
  type: { configurable: true, value: SignalValue },
  props: {
    configurable: true,
    get() {
      return { data: this };
    },
  },
  ref: { configurable: true, value: null },
});

export function useSignal<T>(value: T) {
  return useMemo(() => signal<T>(value), Empty);
}

export function useComputed<T>(compute: () => T) {
  const $compute = useRef(compute);
  $compute.current = compute;
  return useMemo(() => computed<T>(() => $compute.current()), Empty);
}

export function useSignalEffect(cb: () => void | (() => void)) {
  const callback = useRef(cb);
  callback.current = cb;

  useEffect(() => {
    return effect(() => callback.current());
  }, Empty);
}
