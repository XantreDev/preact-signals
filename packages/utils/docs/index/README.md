**Preact signals utils documentation** • [API](../README.md)

***

[Preact signals utils documentation](../README.md) / index

# index

## Namespaces

- [Store](namespaces/Store.md)

## References

### ReactiveRef

Renames and re-exports [Uncached](README.md#uncachedt)

### WritableReactiveRef

Renames and re-exports [WritableUncached](README.md#writableuncachedt)

## Classes

### DeepSignal\<T\>

#### Extends

- `Signal`\<`T`\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Constructors

##### new DeepSignal(value)

```ts
new DeepSignal<T>(value): DeepSignal<T>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

###### Returns

[`DeepSignal`](README.md#deepsignalt)\<`T`\>

###### Overrides

`Signal<T>.constructor`

###### Source

[store/deepSignal.ts:35](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L35)

#### Properties

##### \_\_not\_exist\_deepSignal

```ts
__not_exist_deepSignal: true;
```

###### Source

[store/deepSignal.ts:46](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L46)

##### brand

```ts
brand: typeof identifier;
```

###### Inherited from

`Signal.brand`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:11

##### key

```ts
key: null | string;
```

###### Inherited from

`Signal.key`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:136

##### props

```ts
props: any;
```

###### Inherited from

`Signal.props`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:135

##### type

```ts
type: string | JSXElementConstructor<any>;
```

###### Inherited from

`Signal.type`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:134

#### Accessors

##### value

```ts
get value(): T
```

```ts
set value(value): void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

###### Returns

`T`

###### Source

[store/deepSignal.ts:41](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L41)

#### Methods

##### peek()

```ts
peek(): T
```

###### Returns

`T`

###### Inherited from

`Signal.peek`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:10

##### subscribe()

```ts
subscribe(fn): () => void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `fn` | (`value`) => `void` |

###### Returns

`Function`

> ###### Returns
>
> `void`
>

###### Inherited from

`Signal.subscribe`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:6

##### toJSON()

```ts
toJSON(): T
```

###### Returns

`T`

###### Inherited from

`Signal.toJSON`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:9

##### toString()

```ts
toString(): string
```

###### Returns

`string`

###### Inherited from

`Signal.toString`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:8

##### valueOf()

```ts
valueOf(): T
```

###### Returns

`T`

###### Inherited from

`Signal.valueOf`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:7

***

### Uncached\<T\>

ReactiveRef class extends Signal class and allows to use it in JSX.
Usually you don't need to use it directly, use `$` function instead.

#### Extends

- `Signal`\<`T`\>.`Element`

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Constructors

##### new Uncached(accessor)

```ts
new Uncached<T>(accessor): Uncached<T>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `accessor` | [`Accessor`](README.md#accessort)\<`T`\> |

###### Returns

[`Uncached`](README.md#uncachedt)\<`T`\>

###### Overrides

`Signal<T>.constructor`

###### Source

[$.ts:19](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L19)

#### Properties

##### brand

```ts
brand: typeof identifier;
```

###### Inherited from

`Signal.brand`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:11

##### key

```ts
key: null | string;
```

###### Inherited from

`Signal.key`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:136

##### props

```ts
props: any;
```

###### Inherited from

`Signal.props`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:135

##### type

```ts
type: string | JSXElementConstructor<any>;
```

###### Inherited from

`Signal.type`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:134

#### Accessors

##### value

```ts
get value(): T
```

###### Returns

`T`

###### Source

[$.ts:20](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L20)

#### Methods

##### \_a()

`Internal`

```ts
_a(): T
```

###### Returns

`T`

###### Source

[$.ts:25](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L25)

##### peek()

```ts
peek(): T
```

###### Returns

`T`

###### Overrides

`Signal.peek`

###### Source

[$.ts:21](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L21)

##### subscribe()

```ts
subscribe(fn): () => void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `fn` | (`value`) => `void` |

###### Returns

`Function`

> ###### Returns
>
> `void`
>

###### Inherited from

`Signal.subscribe`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:6

##### toJSON()

```ts
toJSON(): T
```

###### Returns

`T`

###### Inherited from

`Signal.toJSON`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:9

##### toString()

```ts
toString(): string
```

###### Returns

`string`

###### Overrides

`Signal.toString`

###### Source

[$.ts:23](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L23)

##### valueOf()

```ts
valueOf(): T
```

###### Returns

`T`

###### Overrides

`Signal.valueOf`

###### Source

[$.ts:22](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L22)

***

### WritableUncached\<T\>

WritableReactiveRef class extends ReactiveRef class and allows to use it in JSX.
Usually you don't need to use it directly, use `$w` function instead.

#### Extends

- [`Uncached`](README.md#uncachedt)\<`T`\>.`Element`

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Constructors

##### new WritableUncached(get, set)

```ts
new WritableUncached<T>(get, set): WritableUncached<T>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `get` | () => `T` |
| `set` | (`value`) => `void` |

###### Returns

[`WritableUncached`](README.md#writableuncachedt)\<`T`\>

###### Overrides

[`Uncached`](README.md#uncachedt).[`constructor`](README.md#constructors-1)

###### Source

[$.ts:34](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L34)

#### Properties

##### brand

```ts
brand: typeof identifier;
```

###### Inherited from

[`Uncached`](README.md#uncachedt).[`brand`](README.md#brand-1)

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:11

##### key

```ts
key: null | string;
```

###### Inherited from

[`Uncached`](README.md#uncachedt).[`key`](README.md#key-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:136

##### props

```ts
props: any;
```

###### Inherited from

[`Uncached`](README.md#uncachedt).[`props`](README.md#props-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:135

##### type

```ts
type: string | JSXElementConstructor<any>;
```

###### Inherited from

[`Uncached`](README.md#uncachedt).[`type`](README.md#type-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:134

#### Accessors

##### value

```ts
set value(value): void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

###### Source

[$.ts:33](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L33)

#### Methods

##### \_a()

`Internal`

```ts
_a(): T
```

###### Returns

`T`

###### Inherited from

[`Uncached`](README.md#uncachedt).[`_a`](README.md#_a)

###### Source

[$.ts:25](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L25)

##### \_s()

```ts
_s(value): void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

###### Returns

`void`

###### Source

[$.ts:35](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L35)

##### peek()

```ts
peek(): T
```

###### Returns

`T`

###### Inherited from

[`Uncached`](README.md#uncachedt).[`peek`](README.md#peek-1)

###### Source

[$.ts:21](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L21)

##### subscribe()

```ts
subscribe(fn): () => void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `fn` | (`value`) => `void` |

###### Returns

`Function`

> ###### Returns
>
> `void`
>

###### Inherited from

[`Uncached`](README.md#uncachedt).[`subscribe`](README.md#subscribe-1)

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:6

##### toJSON()

```ts
toJSON(): T
```

###### Returns

`T`

###### Inherited from

[`Uncached`](README.md#uncachedt).[`toJSON`](README.md#tojson-1)

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:9

##### toString()

```ts
toString(): string
```

###### Returns

`string`

###### Inherited from

[`Uncached`](README.md#uncachedt).[`toString`](README.md#tostring-1)

###### Source

[$.ts:23](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L23)

##### valueOf()

```ts
valueOf(): T
```

###### Returns

`T`

###### Inherited from

[`Uncached`](README.md#uncachedt).[`valueOf`](README.md#valueof-1)

###### Source

[$.ts:22](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L22)

## Interfaces

### Accessor()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Accessor(): T
```

#### Returns

`T`

#### Source

[utils/type.ts:5](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L5)

***

### Errored()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Errored(): undefined
```

#### Returns

`undefined`

#### Source

[resource/resource.ts:70](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L70)

#### Properties

##### error

```ts
error: unknown;
```

###### Source

[resource/resource.ts:68](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L68)

##### latest

```ts
latest: undefined | T;
```

###### Source

[resource/resource.ts:69](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L69)

##### loading

```ts
loading: false;
```

###### Source

[resource/resource.ts:67](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L67)

##### state

```ts
state: "errored";
```

###### Source

[resource/resource.ts:66](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L66)

***

### Pending()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Pending(): undefined
```

#### Returns

`undefined`

#### Source

[resource/resource.ts:46](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L46)

#### Properties

##### error

```ts
error: undefined;
```

###### Source

[resource/resource.ts:44](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L44)

##### latest

```ts
latest: undefined | T;
```

###### Source

[resource/resource.ts:45](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L45)

##### loading

```ts
loading: true;
```

###### Source

[resource/resource.ts:43](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L43)

##### state

```ts
state: "pending";
```

###### Source

[resource/resource.ts:42](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L42)

***

### Ready()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Ready(): T
```

#### Returns

`T`

#### Source

[resource/resource.ts:54](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L54)

#### Properties

##### error

```ts
error: undefined;
```

###### Source

[resource/resource.ts:52](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L52)

##### latest

```ts
latest: T;
```

###### Source

[resource/resource.ts:53](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L53)

##### loading

```ts
loading: false;
```

###### Source

[resource/resource.ts:51](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L51)

##### state

```ts
state: "ready";
```

###### Source

[resource/resource.ts:50](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L50)

***

### Refreshing()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Refreshing(): undefined
```

#### Returns

`undefined`

#### Source

[resource/resource.ts:62](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L62)

#### Properties

##### error

```ts
error: undefined;
```

###### Source

[resource/resource.ts:60](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L60)

##### latest

```ts
latest: undefined | T;
```

###### Source

[resource/resource.ts:61](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L61)

##### loading

```ts
loading: true;
```

###### Source

[resource/resource.ts:59](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L59)

##### state

```ts
state: "refreshing";
```

###### Source

[resource/resource.ts:58](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L58)

***

### Setter()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Setter(value): T
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | (`prev`) => `T` |

#### Returns

`T`

#### Source

[utils/type.ts:26](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L26)

```ts
interface Setter(value): T
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `Exclude`\<`T`, `Function`\> |

#### Returns

`T`

#### Source

[utils/type.ts:27](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L27)

```ts
interface Setter(value): T
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `Exclude`\<`T`, `Function`\> \| (`prev`) => `T` |

#### Returns

`T`

#### Source

[utils/type.ts:28](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L28)

***

### Unresolved()\<T\>

A resource that waits for a source to be truthy before fetching.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Unresolved(): undefined
```

#### Returns

`undefined`

#### Source

[resource/resource.ts:38](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L38)

#### Properties

##### error

```ts
error: undefined;
```

###### Source

[resource/resource.ts:36](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L36)

##### latest

```ts
latest: undefined | T;
```

###### Source

[resource/resource.ts:37](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L37)

##### loading

```ts
loading: false;
```

###### Source

[resource/resource.ts:35](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L35)

##### state

```ts
state: "unresolved";
```

###### Source

[resource/resource.ts:34](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L34)

## Type Aliases

### AnyReactive

```ts
type AnyReactive: Reactive<any>;
```

#### Source

[utils/type.ts:9](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L9)

***

### CreateFunction\<TArgs, TResult\>

```ts
type CreateFunction<TArgs, TResult>: (...args) => TResult;
```

#### Type parameters

| Type parameter |
| :------ |
| `TArgs` extends readonly `any`[] |
| `TResult` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | `TArgs` |

#### Returns

`TResult`

#### Source

[utils/type.ts:31](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L31)

***

### CreateResourceReturn\<TResult, TRefreshing\>

```ts
type CreateResourceReturn<TResult, TRefreshing>: [ResourceState<TResult>, ResourceActions<TResult | undefined, TRefreshing>];
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TRefreshing` | `unknown` |

#### Source

[resource/createResource.ts:9](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/createResource.ts#L9)

***

### ExplicitFalsy

```ts
type ExplicitFalsy: false | null | undefined;
```

#### Source

[utils/explicitFalsy.ts:1](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/explicitFalsy.ts#L1)

***

### FlatStore\<T\>

```ts
type FlatStore<T>: Opaque<T, "@preact-signals/utils;flatStore">;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Source

[flat-store/createFlatStore.ts:79](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L79)

***

### FlatStoreOfSignalsBody\<T\>

```ts
type FlatStoreOfSignalsBody<T>: SetReadonly<{ [TKey in keyof T]: T[TKey] extends ReadonlySignal<infer TValue> ? TValue : T[TKey] }, ReadonlySignalsKeys<T>>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Source

[flat-store/createFlatStore.ts:111](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L111)

***

### GetTruthyValue\<T, TFalsy\>

```ts
type GetTruthyValue<T, TFalsy>: T extends Accessor<infer U | TFalsy> ? U : T extends ReadonlySignal<infer U | TFalsy> ? U : never;
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | - |
| `TFalsy` | [`ExplicitFalsy`](README.md#explicitfalsy) |

#### Source

[utils/type.ts:11](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L11)

***

### GetValue\<T\>

```ts
type GetValue<T>: T extends Accessor<infer U> ? U : T extends ReadonlySignal<infer U> ? U : never;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[utils/type.ts:19](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L19)

***

### InitializedResource\<T\>

```ts
type InitializedResource<T>: Ready<T> | Refreshing<T> | Errored<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[resource/resource.ts:90](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L90)

***

### Reactive\<T\>

```ts
type Reactive<T>: ReadonlySignal<T> | Accessor<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[utils/type.ts:7](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/type.ts#L7)

***

### ReadonlyFlatStore\<T\>

```ts
type ReadonlyFlatStore<T>: Readonly<FlatStore<T>>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Source

[flat-store/createFlatStore.ts:84](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L84)

***

### ReadonlySignalsKeys\<T\>

```ts
type ReadonlySignalsKeys<T>: keyof { [TKey in keyof T as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] };
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyRecord`](../hooks.md#anyrecord) |

#### Source

[flat-store/createFlatStore.ts:119](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L119)

***

### Resource\<TResult, TSource, TRefreshing, TSourceData\>

```ts
type Resource<TResult, TSource, TRefreshing, TSourceData>: ResourceState<TResult> & {
  _mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
  _refetch: ResourceActions<TResult, TRefreshing>["refetch"];
  _state: FlatStore<ResourceStore<TResult, TSource>>;
  abortController: AbortController | null;
  fetcher: ResourceFetcher<TSourceData, TResult, TRefreshing>;
  isInitialValueProvided: boolean;
  manualActivation: boolean;
  mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
  pr: Promise<TResult> | null;
  refetch: ResourceActions<TResult, TRefreshing>["refetch"];
  refetchData: boolean | TRefreshing;
  refetchEffect: null | () => void;
  refreshDummy$: Signal<boolean>;
  setter: FlatStoreSetter<ResourceStore<TResult, TSource>>;
  get initialized: boolean;
  _fetch: void;
  _init: void;
  _latest: undefined | TResult;
  _onRead: void;
  _read: undefined | TResult;
  activate: Dispose;
  dispose: void;
  refetchDetector: {
     refetching: TRefreshing | boolean;
     source: GetValue<TSource>;
  };
};
```

#### Type declaration

##### \_mutate

`Internal`

```ts
_mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
```

##### \_refetch

`Internal`

```ts
_refetch: ResourceActions<TResult, TRefreshing>["refetch"];
```

##### \_state

`Internal`

```ts
_state: FlatStore<ResourceStore<TResult, TSource>>;
```

##### abortController

`Internal`

```ts
abortController: AbortController | null;
```

##### fetcher

`Internal`

```ts
fetcher: ResourceFetcher<TSourceData, TResult, TRefreshing>;
```

##### isInitialValueProvided

`Internal`

```ts
isInitialValueProvided: boolean;
```

##### manualActivation

`Internal`

```ts
manualActivation: boolean;
```

##### mutate

```ts
mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
```

##### pr

`Internal`

```ts
pr: Promise<TResult> | null;
```

##### refetch

```ts
refetch: ResourceActions<TResult, TRefreshing>["refetch"];
```

##### refetchData

`Internal`

```ts
refetchData: boolean | TRefreshing;
```

##### refetchEffect

`Internal`

```ts
refetchEffect: null | () => void;
```

##### refreshDummy$

`Internal`

```ts
refreshDummy$: Signal<boolean>;
```

##### setter

`Internal`

```ts
setter: FlatStoreSetter<ResourceStore<TResult, TSource>>;
```

##### initialized

```ts
get initialized(): boolean
```

###### Returns

`boolean`

##### \_fetch()

`Internal`

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.refetching` | `TRefreshing` \| `boolean` |
| `data.source` | [`GetTruthyValue`](README.md#gettruthyvaluettfalsy)\<`TSource`\> |

###### Returns

`void`

##### \_init()

`Internal`

###### Returns

`void`

##### \_latest()

`Internal`

###### Returns

`undefined` \| `TResult`

##### \_onRead()

`Internal`

###### Returns

`void`

##### \_read()

`Internal`

###### Returns

`undefined` \| `TResult`

##### activate()

A function that should be used to activate the resource with manualActivation option enabled.

###### Returns

`Dispose`

##### dispose()

###### Returns

`void`

##### refetchDetector()

`Internal`

###### Returns

```ts
{
  refetching: TRefreshing | boolean;
  source: GetValue<TSource>;
}
```

###### refetching

```ts
refetching: TRefreshing | boolean;
```

###### source

```ts
source: GetValue<TSource>;
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TSource` extends [`AnyReactive`](README.md#anyreactive) | [`Accessor`](README.md#accessort)\<`true`\> |
| `TRefreshing` | `boolean` |
| `TSourceData` extends [`GetTruthyValue`](README.md#gettruthyvaluettfalsy)\<`TSource`\> | [`GetTruthyValue`](README.md#gettruthyvaluettfalsy)\<`TSource`\> |

#### Source

[resource/resource.ts:155](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L155)

***

### ResourceActions\<TResult, TRefetch\>

```ts
type ResourceActions<TResult, TRefetch>: {
  mutate: Setter<TResult>;
  refetch: (info?) => TResult | Promise<TResult> | undefined | null;
};
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TRefetch` | `unknown` |

#### Type declaration

##### mutate

```ts
mutate: Setter<TResult>;
```

##### refetch

```ts
refetch: (info?) => TResult | Promise<TResult> | undefined | null;
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `info`? | `TRefetch` |

###### Returns

`TResult` \| `Promise`\<`TResult`\> \| `undefined` \| `null`

#### Source

[resource/resource.ts:92](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L92)

***

### ResourceFetcher\<TSourceData, TResult, TRefreshing\>

```ts
type ResourceFetcher<TSourceData, TResult, TRefreshing>: (k, info) => TResult | Promise<TResult>;
```

#### Type parameters

| Type parameter |
| :------ |
| `TSourceData` |
| `TResult` |
| `TRefreshing` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `k` | `TSourceData` |
| `info` | [`ResourceFetcherInfo`](README.md#resourcefetcherinfotsourcedatatrefreshing)\<`TResult`, `TRefreshing`\> |

#### Returns

`TResult` \| `Promise`\<`TResult`\>

#### Source

[resource/resource.ts:99](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L99)

***

### ResourceFetcherInfo\<TSourceData, TRefreshing\>

```ts
type ResourceFetcherInfo<TSourceData, TRefreshing>: {
  refetching: TRefreshing | boolean;
  signal: AbortSignal;
  value: TSourceData | undefined;
};
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TSourceData` | - |
| `TRefreshing` | `unknown` |

#### Type declaration

##### refetching

```ts
refetching: TRefreshing | boolean;
```

##### signal

```ts
signal: AbortSignal;
```

will be aborted if source is updated or resource disposed

##### value

```ts
value: TSourceData | undefined;
```

#### Source

[resource/resource.ts:104](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L104)

***

### ResourceOptions\<TResult, TSource, TRefreshing, TSourceData\>

```ts
type ResourceOptions<TResult, TSource, TRefreshing, TSourceData>: {
  fetcher: ResourceFetcher<TSourceData, TResult, TRefreshing>;
  initialValue: TResult;
  source: TSource;
  } & {
  lazy: boolean;
  } | {
  manualActivation: boolean;
};
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TSource` extends [`AnyReactive`](README.md#anyreactive) | [`Accessor`](README.md#accessort)\<`true`\> |
| `TRefreshing` | `boolean` |
| `TSourceData` extends [`GetTruthyValue`](README.md#gettruthyvaluettfalsy)\<`TSource`\> | [`GetTruthyValue`](README.md#gettruthyvaluettfalsy)\<`TSource`\> |

#### Source

[resource/resource.ts:110](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L110)

***

### ResourceSource\<S\>

```ts
type ResourceSource<S>: () => S | false | null | undefined;
```

#### Type parameters

| Type parameter |
| :------ |
| `S` |

#### Returns

`S` \| `false` \| `null` \| `undefined`

#### Source

[resource/resource.ts:97](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L97)

***

### ResourceState\<T\>

```ts
type ResourceState<T>: 
  | Unresolved<T>
  | Pending<T>
  | Ready<T>
  | Refreshing<T>
| Errored<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[resource/resource.ts:83](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L83)

***

### SolidSignalApi\<T\>

```ts
type SolidSignalApi<T>: readonly [Accessor<T>, Setter<T>];
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[utils/toSolidApi.ts:8](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/toSolidApi.ts#L8)

***

### UnwrapSignal\<T\>

```ts
type UnwrapSignal<T>: T extends DeepSignal<infer V> ? UnwrapSignalSimple<V> : T extends Signal<infer V> ? V : UnwrapSignalSimple<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/deepSignal.ts:12](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L12)

***

### UnwrapSignalSimple\<T\>

```ts
type UnwrapSignalSimple<T>: T extends 
  | Function
  | CollectionTypes
  | BaseTypes
  | Signal
  | {
  [RawSymbol]: true;
  } ? T : T extends ReadonlyArray<any> ? { [K in keyof T]: UnwrapSignalSimple<T[K]> } : T extends object & {
  [ShallowReactiveMarker]: never;
  } ? { [P in keyof T]: P extends symbol ? T[P] : UnwrapSignal<T[P]> } : T;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/deepSignal.ts:18](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L18)

***

### WrapDeepSignal\<T\>

```ts
type WrapDeepSignal<T>: T extends Signal<any> ? T : DeepSignal<UnwrapSignal<T>>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[store/deepSignal.ts:49](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L49)

***

### WritableRefOptions\<T\>

```ts
type WritableRefOptions<T>: {
  get: T;
  set: void;
};
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Type declaration

##### get()

###### Returns

`T`

##### set()

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

###### Returns

`void`

#### Source

[$.ts:47](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L47)

## Functions

### $()

```ts
$<T>(accessor): Uncached<T>
```

ReactiveRef is just accessor function in object wrapper, that allows to use it in JSX
and use `instanceof` to check if it is ReactiveRef. Main difference with Signal is that you shouldn't care about using hooks for it creation.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `accessor` | [`Accessor`](README.md#accessort)\<`T`\> |

#### Returns

[`Uncached`](README.md#uncachedt)\<`T`\>

#### Example

```tsx
const sig = signal(1);

<div>{$(() => sig.value * 10)}</div>
```

Using with component wrapped in `withSignalProps`
```tsx
const C = withSignalProps((props: { a: number }) => {
 return <div>{props.a}</div>;
});

const sig = signal(1);

<C a={$(() => sig.value)} />
```

#### Source

[$.ts:118](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L118)

***

### $w()

```ts
$w<T>(options): WritableUncached<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `options` | [`WritableRefOptions`](README.md#writablerefoptionst)\<`T`\> |

#### Returns

[`WritableUncached`](README.md#writableuncachedt)\<`T`\>

#### Description

`WritableReactiveRef` is accessor and setter function in object wrapper, that allows to use it in JSX.

#### Example

```tsx
const sig = signal({
   a: [1,2,3]
});

const ref = $w({
 get: () => sig.value["a"][0],
 set: (value) => sig.value = { ...sig.value, a: [value, ...sig.value["a"].slice(1)] }
});

<div onClick={() => ref.value++}>{ref}</div>
```

`WritableReactiveRef` is also handy with deep reactivity tracking system
```tsx
const sig = deepSignal({
  a: [1,2,3]
});

// more efficient because it doesn't recreate object on each change
const ref = $w({
 get: () => sig.value["a"][0],
 set: (value) => sig.value["a"][0] = value
});
```

`WritableReactiveRef` can be used as prop with component wrapped in `withSignalProps`
```tsx
const C = withSignalProps((props: { a: number }) => {
 return <div>{props.a}</div>;
});

const sig = signal(1);
const ref = $w({
 get: () => sig.value,
 set(value) {
   sig.value = value;
 },
})

<C a={ref} />
```

#### Source

[$.ts:167](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L167)

***

### accessorOfReactive()

```ts
accessorOfReactive<T>(signalOrAccessor): Accessor<GetValue<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyReactive`](README.md#anyreactive) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `signalOrAccessor` | [`AnyReactive`](README.md#anyreactive) |

#### Returns

[`Accessor`](README.md#accessort)\<[`GetValue`](README.md#getvaluet)\<`T`\>\>

#### Source

[utils/reactive.ts:3](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/reactive.ts#L3)

***

### accessorOfSignal()

```ts
accessorOfSignal<T>(s): Accessor<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `s` | `ReadonlySignal`\<`T`\> |

#### Returns

[`Accessor`](README.md#accessort)\<`T`\>

#### Source

[utils/getter.ts:8](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/getter.ts#L8)

***

### createFlatStore()

```ts
createFlatStore<T>(initialState): readonly [FlatStore<T>, FlatStoreSetter<T>]
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `initialState` | `T` |

#### Returns

readonly [[`FlatStore`](README.md#flatstoret)\<`T`\>, `FlatStoreSetter`\<`T`\>]

#### Source

[flat-store/createFlatStore.ts:161](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L161)

***

### createFlatStoreOfSignals()

```ts
createFlatStoreOfSignals<T>(initialState): readonly [FlatStore<SetReadonly<{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }, keyof { [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }>>, FlatStoreSetter<SetReadonly<{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }, keyof { [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }>>]
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `initialState` | `T` |

#### Returns

readonly [[`FlatStore`](README.md#flatstoret)\<`SetReadonly`\<`{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }`, keyof `{ [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }`\>\>, `FlatStoreSetter`\<`SetReadonly`\<`{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }`, keyof `{ [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }`\>\>]

#### Source

[flat-store/createFlatStore.ts:169](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L169)

***

### createResource()

```ts
createResource<TResult, TSource, TRefreshing>(options): CreateResourceReturn<TResult, TRefreshing>
```

Creates a resource that wraps a repeated promise in a reactive pattern:
```typescript
// Without source
const [resource, { mutate, refetch }] = createResource({
 fetcher: () => fetch("https://swapi.dev/api/people/1").then((r) => r.json()),
});
// With source
const [resource, { mutate, refetch }] = createResource({
  source: () => userId.value,
  fetcher: (userId) => fetch(`https://swapi.dev/api/people/${userId}`).then((r) => r.json()),
});
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TSource` extends [`AnyReactive`](README.md#anyreactive) | [`Accessor`](README.md#accessort)\<`true`\> |
| `TRefreshing` | `boolean` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ResourceOptions`](README.md#resourceoptionstresulttsourcetrefreshingtsourcedata)\<`TResult`, `TSource`, `TRefreshing`\> | Contains all options for creating resource |

#### Returns

[`CreateResourceReturn`](README.md#createresourcereturntresulttrefreshing)\<`TResult`, `TRefreshing`\>

```typescript
[ResourceState<TResult>, { mutate: Setter<T>, refetch: () => void }]
```

* Setting an `initialValue` in the options will mean that resource will be created in `ready` state
* `mutate` allows to manually overwrite the resource without calling the fetcher
* `refetch` will re-run the fetcher without changing the source, and if called with a value, that value will be passed to the fetcher via the `refetching` property on the fetcher's second parameter

#### Source

[resource/createResource.ts:39](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/createResource.ts#L39)

***

### deepSignal()

```ts
deepSignal<T>(value): WrapDeepSignal<T>
```

Takes an inner value and returns a reactive and mutable signal, with deepReactive inside of it.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The object to wrap in the deepSignal. |

#### Returns

[`WrapDeepSignal`](README.md#wrapdeepsignalt)\<`T`\>

#### Source

[store/deepSignal.ts:59](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/deepSignal.ts#L59)

***

### flatStore()

```ts
flatStore<T>(initialState): FlatStore<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `initialState` | `T` | this value will be **mutated** and proxied |

#### Returns

[`FlatStore`](README.md#flatstoret)\<`T`\>

#### Source

[flat-store/createFlatStore.ts:93](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L93)

***

### flatStoreOfSignals()

```ts
flatStoreOfSignals<T>(initialState): FlatStore<SetReadonly<{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }, keyof { [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `initialState` | `T` | this value will be **mutated** and proxied |

#### Returns

[`FlatStore`](README.md#flatstoret)\<`SetReadonly`\<`{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }`, keyof `{ [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }`\>\>

#### Source

[flat-store/createFlatStore.ts:132](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/flat-store/createFlatStore.ts#L132)

***

### isExplicitFalsy()

```ts
isExplicitFalsy(value): value is ExplicitFalsy
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `unknown` |

#### Returns

`value is ExplicitFalsy`

#### Source

[utils/explicitFalsy.ts:3](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/explicitFalsy.ts#L3)

***

### isSignal()

```ts
isSignal(val): val is Signal<any>
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `val` | `unknown` |

#### Returns

`val is Signal<any>`

#### Source

[store/utils.ts:119](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/store/utils.ts#L119)

***

### rafReaction()

```ts
rafReaction<T>(
   deps, 
   fn, 
   options?): Dispose
```

Creates a reactive effect that runs the given function whenever any of the dependencies change **in requestAnimationFrame**.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `deps` | () => `T` | A function that returns the dependencies for the effect. |
| `fn` | (`dep`, `options`) => `void` | A function that runs after deps changes in next requestAnimationFrame. It receives the dependencies and an options object with a `isFirst` property that is `true` on the first run of the effect. |
| `options`? | `ReactionOptions` | A options object that contains `memoize` prop that tells should deps function result be memoized |

#### Returns

`Dispose`

A function that can be called to dispose of the effect.

#### Source

[utils/reaction.ts:159](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/reaction.ts#L159)

***

### reaction()

```ts
reaction<T>(
   deps, 
   fn, 
   options?): Dispose
```

Creates a reactive effect that runs the given function whenever any of the dependencies change.

`reaction` is enhanced version of this:
```ts
effect(() => {
 const value = deps();
 untracked(() => fn(value));
});
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `deps` | () => `T` | A function that returns the dependencies for the effect. |
| `fn` | (`dep`, `options`) => `void` \| `ReactionDispose` | A function that runs the effect. It receives the dependencies and an options object with a `isFirst` property that is `true` on the first run of the effect. |
| `options`? | `ReactionOptions` | A options object that contains `memoize` prop that tells should deps function result be memoized |

#### Returns

`Dispose`

A function that can be called to dispose of the effect.

#### Source

[utils/reaction.ts:115](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/reaction.ts#L115)

***

### resource()

```ts
resource<TResult, TSource, TRefreshing, TSourceData>(options): Resource<TResult, TSource, TRefreshing, TSourceData>
```

More preact signals like resource api

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TSource` extends [`AnyReactive`](README.md#anyreactive) | [`Accessor`](README.md#accessort)\<`true`\> |
| `TRefreshing` | `boolean` |
| `TSourceData` extends `any` | [`GetTruthyValue`](README.md#gettruthyvaluettfalsy)\<`TSource`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `options` | \{ `fetcher`: [`ResourceFetcher`](README.md#resourcefetchertsourcedatatresulttrefreshing)\<`TSourceData`, `TResult`, `TRefreshing`\>; `initialValue`: `TResult`; `source`: `TSource`; } & \{ `lazy`: `boolean`; } \| \{ `manualActivation`: `boolean`; } |

#### Returns

[`Resource`](README.md#resourcetresulttsourcetrefreshingtsourcedata)\<`TResult`, `TSource`, `TRefreshing`, `TSourceData`\>

#### Source

[resource/resource.ts:521](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/resource/resource.ts#L521)

***

### setterOfSignal()

```ts
setterOfSignal<T>(signal): Setter<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `signal` | `Signal`\<`T`\> |

#### Returns

[`Setter`](README.md#settert)\<`T`\>

#### Source

[utils/setter.ts:15](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/setter.ts#L15)

***

### signalOf$()

```ts
signalOf$<T>($value): ReadonlySignal<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `$value` | [`Uncached`](README.md#uncachedt)\<`T`\> |

#### Returns

`ReadonlySignal`\<`T`\>

#### Source

[$.ts:171](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/$.ts#L171)

***

### stableAccessorOfSignal()

```ts
stableAccessorOfSignal<T>(s): Accessor<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `s` | `ReadonlySignal`\<`T`\> |

#### Returns

[`Accessor`](README.md#accessort)\<`T`\>

#### Source

[utils/getter.ts:13](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/getter.ts#L13)

***

### toggleSignal()

```ts
toggleSignal(sig): void
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sig` | `Signal`\<`boolean`\> |

#### Returns

`void`

#### Source

[utils/setter.ts:18](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/setter.ts#L18)

***

### untracked()

```ts
untracked<T>(untrackedExecutor): T
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `untrackedExecutor` | () => `T` |

#### Returns

`T`

#### Source

[../../../unified-signals/src/index.d.ts:2](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/unified-signals/src/index.d.ts#L2)

***

### unwrapReactive()

```ts
unwrapReactive<T>(signalOrAccessor): GetValue<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyReactive`](README.md#anyreactive) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `signalOrAccessor` | `T` |

#### Returns

[`GetValue`](README.md#getvaluet)\<`T`\>

#### Source

[utils/reactive.ts:10](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/reactive.ts#L10)

***

### writableRefOfArrayProp()

```ts
writableRefOfArrayProp<T, TIndex>(array, index): WritableUncached<T[TIndex]>
```

Allows to create writableRef to array element of Signal. Using of `deepSignal` is preferred, but this API can be handy if you avoiding to use deep reactivity tracking system.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends readonly `any`[] |
| `TIndex` extends `number` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `array` | [`WritableUncached`](README.md#writableuncachedt)\<`T`\> \| `Signal`\<`T`\> |
| `index` | `TIndex` |

#### Returns

[`WritableUncached`](README.md#writableuncachedt)\<`T`\[`TIndex`\]\>

#### Example

```tsx
const arr = signal([1, 2, 3])

const second = writableRefOfArrayProp(arr, 1)
second.value = 4

console.log(arr.value) // [1, 4, 3]
```

#### Source

[utils/object.ts:52](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/object.ts#L52)

***

### writableRefOfObjectProp()

```ts
writableRefOfObjectProp<T, K>(obj, key): WritableUncached<T[K]>
```

Allows to create writableRef to object property of Signal. Using of `deepSignal` is preferred, but this API can be handy if you avoiding to use deep reactivity tracking system.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |
| `K` extends `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `obj` | [`WritableUncached`](README.md#writableuncachedt)\<`T`\> \| `Signal`\<`T`\> |
| `key` | `K` |

#### Returns

[`WritableUncached`](README.md#writableuncachedt)\<`T`\[`K`\]\>

#### Example

```tsx
const obj = signal({
 a: 1,
 b: 2
})

const a = writableRefOfObjectProp(obj, 'a')
a.value = 2

console.log(obj.value.a) // 2
```

#### Source

[utils/object.ts:22](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/utils/object.ts#L22)
