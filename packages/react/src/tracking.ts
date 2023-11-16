import { effect, Signal } from "@preact/signals-core";
import { useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

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
const enum EffectFields {
  startTracking = "S",
  onDepsChange = "c",
  dispose = "d",
}
interface Effect {
  [EffectFields.startTracking](): () => void;
  [EffectFields.onDepsChange](): void;
  [EffectFields.dispose](): void;
}

export interface EffectStore {
  effect: Effect;
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): number;
  /** finishEffect - stop tracking the signals used in this component */
  f(): void;
  s(): void;
  [symDispose](): void;
}

const enum EffectStoreFields {
  startTracking = "s",
  finishTracking = "f",
}

let useSignalsDepth = 0;
let cleanUpFn: (() => void) | undefined = undefined;
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
  effectInstance[EffectFields.onDepsChange] = function () {
    if (isRendering) {
      return;
    }
    version = (version + 1) | 0;
    if (!onChangeNotifyReact) {
      return;
    }

    onChangeNotifyReact();
  };

  let isRendering = false;
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
    [EffectStoreFields.startTracking]() {
      isRendering = true;
      useSignalsDepth++;
      if (useSignalsDepth === 1) {
        cleanUpFn = effectInstance[EffectFields.startTracking]();
      }
    },
    getSnapshot() {
      return version;
    },
    [EffectStoreFields.finishTracking]() {
      if (useSignalsDepth === 1) {
        cleanUpFn?.();
        cleanUpFn = undefined;
        isRendering = false;
      }
      useSignalsDepth--;
    },
    [symDispose]() {
      this[EffectStoreFields.finishTracking]();
    },
  };
}

/**
 * @description this hook is for `@preact/signals-react-transform`. You should not use it until you know what you do. If s.f() is not called - reactivity will break
 * @example
 * ```tsx
 * const Component = () => {
 *  const s = useSignals()
 *  try {
 *    // reading signals and using hooks here
 *    const counter = useSignal(0)
 *
 *    return (
 *      <button onClick={() => counter.value++}>Click here: {counter.value * 2}</button>
 *    )
 *  } finally {
 *    s.f()
 *  }
 * }
 * ```
 * Custom hook to create the effect to track signals used during render and
 * subscribe to changes to rerender the component when the signals change.
 */
export function useSignals(): EffectStore {
  const storeRef = useRef<EffectStore>();
  if (storeRef.current == null) {
    storeRef.current = createEffectStore();
  }
  const store = storeRef.current;
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  store[EffectStoreFields.startTracking]();
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
    effectStore[EffectStoreFields.finishTracking]();
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
