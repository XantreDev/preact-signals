import {
  ReadonlySignal,
  useComputed,
  useSignal,
  useSignalEffect,
} from "@preact-signals/unified-signals";
import {
  AnimatableValue,
  DerivedValue,
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const useSignalOfSharedValue = <T>(shared: Readonly<SharedValue<T>>) => {
  const sig = useSignal(shared.value);
  const updateSignal = (newValue: T) => {
    sig.value = newValue;
  };
  useAnimatedReaction(
    () => shared.value,
    (newValue) => runOnJS(updateSignal)(newValue),
    [shared]
  );

  return sig as ReadonlySignal<T>;
};

export const useComputedOfSharedValue = <T, TResult>(
  shared: Readonly<SharedValue<T>>,
  compute: (v: T) => TResult
) => {
  const sig = useSignalOfSharedValue(shared);

  return useComputed(() => compute(sig.value));
};

export const useSharedValueOfSignal = <T>(
  _sig: ReadonlySignal<T>
): Readonly<SharedValue<T>> => {
  const shared = useSharedValue(_sig.peek());

  useSignalEffect(() => {
    shared.value = _sig.value;
  });

  return shared;
};

const defaultSharedValueSetter = <T>(
  shared: SharedValue<T>,
  newValue: T
): unknown => (shared.value = newValue);

export type SignalInteropSetter<TTarget, TSource> = (
  target: TTarget,
  source: TSource
) => unknown;
export type SharedValueSetter<T> = SignalInteropSetter<SharedValue<T>, T>;
export const useSharedValueOfAccessor = <T>(
  accessor: () => T,
  setter: SharedValueSetter<T> = defaultSharedValueSetter
): DerivedValue<T> => {
  // memoizing accessor value to not to break animations when accessor deps are changed but value is not
  const accessorSignal = useComputed(accessor);
  const shared = useSharedValue(accessorSignal.peek());

  useSignalEffect(() => {
    setter(shared, accessorSignal.value);
  });

  return shared;
};

export const useAnimatedSharedValueOfAccessor = <T extends AnimatableValue>(
  accessor: () => T,
  animateOptions:
    | {
        type: "timing";
        params?: Parameters<typeof withTiming>[1];
      }
    | { type: "spring"; params?: Parameters<typeof withSpring>[1] }
) =>
  useSharedValueOfAccessor(accessor, (shared, newValue) => {
    if (animateOptions?.type === "timing") {
      shared.value = withTiming(newValue, animateOptions.params);
      return;
    }
    if (animateOptions?.type === "spring") {
      shared.value = withSpring(newValue, animateOptions.params);
      return;
    }

    throw new Error("unknown animateOptions type");
  });

export const useSpringSharedValueOfAccessor = <T extends AnimatableValue>(
  accessor: () => T,
  params?: Parameters<typeof withSpring>[1]
) =>
  useAnimatedSharedValueOfAccessor(accessor, {
    type: "spring",
    params,
  });

export const useTimingSharedValueOfAccessor = <T extends AnimatableValue>(
  accessor: () => T,
  params?: Parameters<typeof withTiming>[1]
) =>
  useAnimatedSharedValueOfAccessor(accessor, {
    type: "timing",
    params,
  });
