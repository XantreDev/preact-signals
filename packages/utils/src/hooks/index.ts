export * from "./flat-store";
export { useResource } from "./resource";
export { useReaction } from "./useReaction";

export { useComputedOnce } from "./useComputedOnce";
export {
  useInitSignal,
  useSignalContext,
  useSignalEffectOnce,
  useSignalOfReactive,
  useSignalOfState
} from "./utility";

// export const useSignalState = <T>(value: T) =>
//   toSolidLikeSignal(useSignal(value));
