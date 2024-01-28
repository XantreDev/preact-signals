export const enum ReactiveFlags {
  RAW = "__ps_raw",
  IS_REACTIVE = "__ps_isReactive",
  IS_READONLY = "__ps_isReadonly",
  IS_SHALLOW = "__ps_isShallow",
  SKIP = "__ps_skip",
}

export const enum TrackOpTypes {
  GET = "get",
  HAS = "has",
  ITERATE = "iterate",
}

export const enum TriggerOpTypes {
  SET = "set",
  ADD = "add",
  DELETE = "delete",
  CLEAR = "clear",
}
