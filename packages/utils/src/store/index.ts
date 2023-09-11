import { Signal } from "@preact-signals/unified-signals";

export const enum ReactiveFlags {
  RAW = "__ps_raw",
  IS_REACTIVE = "__ps_isReactive",
  IS_READONLY = "__ps_isReadonly",
  IS_SHALLOW = "__ps_isShallow",
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

declare const __DEV__: boolean;

/**
 * Always return false.
 */
export const NO = () => false;

class IncrementSignal extends Signal<number> {
  constructor() {
    super(0);
  }

  increment() {
    this.value = (this.peek() + 1) | 0;
  }
}

type KeyToDepMap = Map<any, IncrementSignal>;
const targetMap = new WeakMap<object, KeyToDepMap>();

// maps rawVersions <-> wrapped versions
const reactiveMap = new WeakMap<Target, any>();

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

export const isModelListener = (key: string) => key.startsWith("onUpdate:");

export const extend = Object.assign;

export const remove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key);

export const isArray = Array.isArray;
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === "[object Map]";
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === "[object Set]";

export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === "[object Date]";
export const isRegExp = (val: unknown): val is RegExp =>
  toTypeString(val) === "[object RegExp]";
export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";
export const isString = (val: unknown): val is string =>
  typeof val === "string";
export const isSymbol = (val: unknown): val is symbol =>
  typeof val === "symbol";
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === "object";

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return (
    (isObject(val) || isFunction(val)) &&
    isFunction((val as any).then) &&
    isFunction((val as any).catch)
  );
};
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null);
  const list: Array<string> = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]!] = true;
  }
  return expectsLowerCase
    ? (val) => !!map[val.toLowerCase()]
    : (val) => !!map[val];
}

export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

const isNonTrackableKeys = /*#__PURE__*/ makeMap(`__proto__,__v_isRef,__isVue`);

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1);
};

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === "[object Object]";

export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== "NaN" &&
  key[0] !== "-" &&
  "" + parseInt(key, 10) === key;

interface Target {
  [ReactiveFlags.RAW]?: any;
}

const builtInSymbols = new Set(
  /*#__PURE__*/
  Object.getOwnPropertyNames(Symbol)
    // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
    // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
    // function
    .filter((key) => key !== "arguments" && key !== "caller")
    .map((key) => (Symbol as any)[key])
    .filter(isSymbol)
);

class BaseReactiveHandler implements ProxyHandler<Target> {
  constructor(
    protected readonly _isReadonly = false,
    protected readonly _shallow = false
  ) {}

  get(target: Target, key: string | symbol, receiver: object) {
    const isReadonly = this._isReadonly,
      shallow = this._shallow;
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return shallow;
    } else if (
      key === ReactiveFlags.RAW &&
      receiver === reactiveMap.get(target)
      // (isReadonly
      //   ? shallow
      //     ? shallowReadonlyMap
      //     : readonlyMap
      //   : shallow
      //   ? shallowReactiveMap
      //   : reactiveMap
      // ).get(target)
    ) {
      return target;
    }

    const targetIsArray = isArray(target);

    // if (!isReadonly) {
    //   if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
    //     return Reflect.get(arrayInstrumentations, key, receiver);
    //   }
    //   if (key === "hasOwnProperty") {
    //     return hasOwnProperty;
    //   }
    // }

    const res = Reflect.get(target, key, receiver);

    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key);
    }

    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(shallow = false) {
    super(false, shallow);
  }

  set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = (target as any)[key];
    // if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
    //   return false;
    // }
    // if (!this._shallow) {
    //   if (!isShallow(value) && !isReadonly(value)) {
    //     oldValue = toRaw(oldValue);
    //     value = toRaw(value);
    //   }
    //   if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
    //     oldValue.value = value;
    //     return true;
    //   }
    // } else {
    //   // in shallow mode, objects are set as-is regardless of reactive or not
    // }

    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue);
      }
    }
    return result;
  }

  deleteProperty(target: object, key: string | symbol): boolean {
    const hadKey = hasOwn(target, key);
    const oldValue = (target as any)[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
    }
    return result;
  }

  has(target: object, key: string | symbol): boolean {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, TrackOpTypes.HAS, key);
    }
    return result;
  }
  ownKeys(target: object): (string | symbol)[] {
    track(
      target,
      TrackOpTypes.ITERATE,
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}

const reactiveHandler = new MutableReactiveHandler();

/**
 * Returns the raw, original object of a Vue-created proxy.
 *
 * `toRaw()` can return the original object from proxies created by
 * {@link reactive()}, {@link readonly()}, {@link shallowReactive()} or
 * {@link shallowReadonly()}.
 *
 * This is an escape hatch that can be used to temporarily read without
 * incurring proxy access / tracking overhead or write without triggering
 * changes. It is **not** recommended to hold a persistent reference to the
 * original object. Use with caution.
 *
 * @example
 * ```js
 * const foo = {}
 * const reactiveFoo = reactive(foo)
 *
 * console.log(toRaw(reactiveFoo) === foo) // true
 * ```
 *
 * @param observed - The object for which the "raw" value is requested.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#toraw}
 */
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed;
}

export const readonly = <T extends object>(target: T): T => {
  throw new Error("Not implemented");
};

export const reactive = <T extends object>(target: T): T => {
  if (target && (target as Target)[ReactiveFlags.RAW]) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    reactiveHandler,
    reactiveHandler,
    reactiveMap
  );
};

export const ITERATE_KEY = Symbol(__DEV__ ? "iterate" : "");
export const MAP_KEY_ITERATE_KEY = Symbol(__DEV__ ? "Map key iterate" : "");

const track = (target: Target, type: TrackOpTypes, key: unknown) => {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new IncrementSignal()));
  }

  depsMap.get(key)!.value;
};

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

  let deps: (IncrementSignal | undefined)[] = [];
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

  if (deps.length === 1) {
    if (deps[0]) {
      deps[0].increment();
      // if (__DEV__) {
      //   triggerEffects(deps[0], eventInfo);
      // } else {
      //   triggerEffects(deps[0]);
      // }
    }
  } else {
    for (const dep of deps) {
      if (dep) {
        dep.increment();
        // effects.push(...dep);
      }
    }
    // if (__DEV__) {
    //   triggerEffects(createDep(effects), eventInfo);
    // } else {
    //   triggerEffects(createDep(effects));
    // }
  }
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  // if (
  //   target[ReactiveFlags.RAW] &&
  //   !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  // ) {
  //   return target
  // }
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // only specific value types can be observed.
  // const targetType = getTargetType(target)
  // if (targetType === TargetType.INVALID) {
  //   return target
  // }
  const proxy = new Proxy(
    target,
    baseHandlers
    // targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}

export const createStore = <T extends object>(store: T): T => {
  if (isPlainObject(store)) {
    return reactive(store) as T;
  }

  return store;
};
