import { Signal, batch } from "@preact-signals/unified-signals";
import { TrackOpTypes, TriggerOpTypes } from "./constants";
import { isArray, isIntegerKey, isMap } from "./utils";

type KeyToDepMap = Map<any, InvalidateSignal>;
const targetMap = new WeakMap<object, KeyToDepMap>();

export const ITERATE_KEY = Symbol(__DEV__ ? "iterate" : "");
export const MAP_KEY_ITERATE_KEY = Symbol(__DEV__ ? "Map key iterate" : "");

class InvalidateSignal extends Signal<boolean> {
  constructor() {
    super(false);
  }

  invalidate() {
    this.value = !this.peek();
  }
}

/**
 * Finds all deps associated with the target (or a specific property) and
 * triggers the effects stored within.
 *
 * @param target - The reactive object.
 * @param type - Defines the type of the operation that needs to trigger effects.
 * @param key - Can be used to target a specific reactive property in the target object.
 */
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // never been tracked
    return;
  }

  let deps: (InvalidateSignal | undefined)[] = [];
  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key) => {
      if (key === "length" || key >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }

    // also run for iteration key on ADD | DELETE | Map.SET
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          // new index added to array -> length changes
          deps.push(depsMap.get("length"));
        }
        break;
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }

  // const eventInfo = __DEV__
  //   ? { target, type, key, newValue, oldValue, oldTarget }
  //   : undefined;

  batch(() => {
    for (const item of deps) {
      item?.invalidate();
    }
  });

  // if (deps.length === 1) {
  //   if (deps[0]) {
  //     deps[0].invalidate();
  //     if (__DEV__) {
  //       triggerEffects(deps[0], eventInfo);
  //     } else {
  //       triggerEffects(deps[0]);
  //     }
  //   }
  // } else {
  //   for (const dep of deps) {
  //     if (dep) {
  //       dep.invalidate();
  //     }
  //   }
  //   if (__DEV__) {
  //     triggerEffects(createDep(effects), eventInfo);
  //   } else {
  //     triggerEffects(createDep(effects));
  //   }
  // }
}

export const track = (target: object, type: TrackOpTypes, key: unknown) => {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new InvalidateSignal()));
  }

  dep!.value;
};
