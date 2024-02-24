**Preact signals utils documentation** • [API](../../README.md)

***

[Preact signals utils documentation](../../README.md) / [index](../README.md) / Store

# Namespace: Store

## Type Aliases

### DeepReadonly\<T\>

```ts
type DeepReadonly<T>: T extends Builtin ? T : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends WeakMap<infer K, infer V> ? WeakMap<DeepReadonly<K>, DeepReadonly<V>> : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends ReadonlySet<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends WeakSet<infer U> ? WeakSet<DeepReadonly<U>> : T extends Promise<infer U> ? Promise<DeepReadonly<U>> : T extends Signal<infer U> ? Readonly<ReadonlySignal<DeepReadonly<U>>> : T extends {} ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : Readonly<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/reactivity.ts:170](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L170)

***

### Raw\<T\>

```ts
type Raw<T>: T & {
  [RawSymbol]: true;
};
```

#### Type declaration

##### [RawSymbol]?

```ts
optional [RawSymbol]: true;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/reactivity.ts:364](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L364)

***

### ShallowReactive\<T\>

```ts
type ShallowReactive<T>: T & {
  [ShallowReactiveMarker]: true;
};
```

#### Type declaration

##### [ShallowReactiveMarker]?

```ts
optional [ShallowReactiveMarker]: true;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/reactivity.ts:125](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L125)

***

### UnwrapNestedSignals\<T\>

```ts
type UnwrapNestedSignals<T>: T extends Signal ? T : UnwrapSignalSimple<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/reactivity.ts:25](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L25)

## Functions

### deepReactive()

```ts
deepReactive<T>(target): UnwrapNestedSignals<T>
```

Returns a reactive proxy of the object.

The reactive conversion is "deep": it affects all nested properties. A
reactive object also deeply unwraps any properties that are refs while
maintaining reactivity.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The object to be made reactive. |

#### Returns

[`UnwrapNestedSignals`](Store.md#unwrapnestedsignalst)\<`T`\>

#### Example

```js
const obj = reactive({ count: 0 })
```

#### Source

[store/reactivity.ts:108](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L108)

***

### deepReadonly()

```ts
deepReadonly<T>(target): DeepReadonly<UnwrapNestedSignals<T>>
```

takes an object (reactive or plain) or a ref and returns a readonly proxy to
the original.

a readonly proxy is deep: any nested property accessed will be readonly as
well. it also has the same ref-unwrapping behavior as deepreactive(),
except the unwrapped values will also be made readonly.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The source object. |

#### Returns

[`DeepReadonly`](Store.md#deepreadonlyt)\<[`UnwrapNestedSignals`](Store.md#unwrapnestedsignalst)\<`T`\>\>

#### Example

```js
const original = reactive({ count: 0 })

const copy = readonly(original)

watcheffect(() => {
  // works for reactivity tracking
  console.log(copy.count)
})

// mutating original will trigger watchers relying on the copy
original.count++

// mutating the copy will fail and result in a warning
copy.count++ // warning!
```

#### Source

[store/reactivity.ts:220](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L220)

***

### isProxy()

```ts
isProxy(value): boolean
```

Checks if an object is a proxy created by [deepReactive](Store.md#deepreactive),
[deepReadonly](Store.md#deepreadonly), [shallowReactive](Store.md#shallowreactive) or [()](Store.md#shallowreadonly).

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | The value to check. |

#### Returns

`boolean`

#### Source

[store/reactivity.ts:358](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L358)

***

### isReactive()

```ts
isReactive(value): boolean
```

Checks if an object is a proxy created by [()](Store.md#deepreactive) or
[()](Store.md#shallowreactive) (or ref() in some cases).

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | The value to check. |

#### Returns

`boolean`

#### Example

```js
isReactive(reactive({}))            // => true
isReactive(readonly(reactive({})))  // => true
isReactive(ref({}).value)           // => true
isReactive(readonly(ref({})).value) // => true
isReactive(ref(true))               // => false
isReactive(shallowRef({}).value)    // => false
isReactive(shallowReactive({}))     // => true
```

#### Source

[store/reactivity.ts:327](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L327)

***

### isReadonly()

```ts
isReadonly(value): boolean
```

Checks whether the passed value is a readonly object. The properties of a
readonly object can change, but they can't be assigned directly via the
passed object.

The proxies created by [()](Store.md#deepreadonly) and [()](Store.md#shallowreadonly) are
both considered readonly, as is a computed ref without a set function.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | The value to check. |

#### Returns

`boolean`

#### Source

[store/reactivity.ts:344](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L344)

***

### isShallow()

```ts
isShallow(value): boolean
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `unknown` |

#### Returns

`boolean`

#### Source

[store/reactivity.ts:348](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L348)

***

### markRaw()

```ts
markRaw<T>(value): Raw<T>
```

Marks an object so that it will never be converted to a proxy. Returns the
object itself.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The object to be marked as "raw". |

#### Returns

[`Raw`](Store.md#rawt)\<`T`\>

#### Example

```js
const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// also works when nested inside other reactive objects
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false
```

**Warning:** `markRaw()` together with the shallow APIs such as
[()](Store.md#shallowreactive) allow you to selectively opt-out of the default
deep reactive/readonly conversion and embed raw, non-proxied objects in your
state graph.

#### Source

[store/reactivity.ts:387](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L387)

***

### shallowReactive()

```ts
shallowReactive<T>(target): ShallowReactive<T>
```

Shallow version of [()](Store.md#deepreactive).

Unlike [()](Store.md#deepreactive), there is no deep conversion: only root-level
properties are reactive for a shallow reactive object. Property values are
stored and exposed as-is - this also means properties with ref values will
not be automatically unwrapped.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The source object. |

#### Returns

[`ShallowReactive`](Store.md#shallowreactivet)\<`T`\>

#### Example

```js
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// mutating state's own properties is reactive
state.foo++

// ...but does not convert nested objects
isReactive(state.nested) // false

// NOT reactive
state.nested.bar++
```

#### Source

[store/reactivity.ts:156](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L156)

***

### shallowReadonly()

```ts
shallowReadonly<T>(target): Readonly<T>
```

Shallow version of [()](Store.md#deepreadonly).

Unlike [()](Store.md#deepreadonly), there is no deep conversion: only root-level
properties are made readonly. Property values are stored and exposed as-is -
this also means properties with ref values will not be automatically
unwrapped.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The source object. |

#### Returns

`Readonly`\<`T`\>

#### Example

```js
const state = shallowReadonly({
  foo: 1,
  nested: {
    bar: 2
  }
})

// mutating state's own properties will fail
state.foo++

// ...but works on nested objects
isReadonly(state.nested) // false

// works
state.nested.bar++
```

#### Source

[store/reactivity.ts:261](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L261)

***

### toDeepReactive()

```ts
toDeepReactive<T>(value): T
```

Returns a reactive proxy of the given value (if possible).

If the given value is not an object, the original value itself is returned.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `unknown` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The value for which a reactive proxy shall be created. |

#### Returns

`T`

#### Source

[store/reactivity.ts:399](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L399)

***

### toDeepReadonly()

```ts
toDeepReadonly<T>(value): T
```

Returns a readonly proxy of the given value (if possible).

If the given value is not an object, the original value itself is returned.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `unknown` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The value for which a readonly proxy shall be created. |

#### Returns

`T`

#### Source

[store/reactivity.ts:409](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L409)

***

### toRaw()

```ts
toRaw<T>(observed): T
```

Returns the raw, original object of a Vue-created proxy.

`toRaw()` can return the original object from proxies created by
[()](Store.md#deepreactive), [()](Store.md#deepreadonly), [()](Store.md#shallowreactive) or
[()](Store.md#shallowreadonly).

This is an escape hatch that can be used to temporarily read without
incurring proxy access / tracking overhead or write without triggering
changes. It is **not** recommended to hold a persistent reference to the
original object. Use with caution.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `observed` | `T` | The object for which the "raw" value is requested. |

#### Returns

`T`

#### Example

```js
const foo = {}
const reactiveFoo = reactive(foo)

console.log(toRaw(reactiveFoo) === foo) // true
```

#### Source

[store/reactivity.ts:86](https://github.com/XantreGodlike/preact-signals/blob/b56c517/packages/utils/src/lib/store/reactivity.ts#L86)
