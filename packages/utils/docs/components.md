**Preact signals utils documentation** • [API](README.md)

***

[Preact signals utils documentation](README.md) / components

# components

## Type Aliases

### ComputedProps

```ts
type ComputedProps: {
  children: Accessor<RenderResult>;
};
```

#### Type declaration

##### children

```ts
children: Accessor<RenderResult>;
```

#### Source

[components/components/Computed.tsx:5](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Computed.tsx#L5)

***

### ForProps\<T\>

```ts
type ForProps<T>: {
  children: (accessor, index) => RenderResult;
  each: T;
  fallback: RenderResult;
  } & GetArrItemValue<T> extends React.Key ? {
  keyExtractor: KeyExtractor<GetArrItemValue<T>>;
  } : {
  keyExtractor: KeyExtractor<GetArrItemValue<T>>;
};
```

#### Type declaration

##### children

```ts
children: (accessor, index) => RenderResult;
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `accessor` | `GetArrItemValue`\<`T`\> |
| `index` | `number` |

###### Returns

[`RenderResult`](components.md#renderresult)

##### each

```ts
each: T;
```

##### fallback?

```ts
optional fallback: RenderResult;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`Reactive`](index/README.md#reactivet)\<`any`[]\> |

#### Source

[components/components/For.tsx:13](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/For.tsx#L13)

***

### If\<T, A, B\>

```ts
type If<T, A, B>: T extends true ? A : B;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `boolean` |
| `A` |
| `B` |

#### Source

[components/type.ts:2](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/type.ts#L2)

***

### KeyExtractor\<T\>

```ts
type KeyExtractor<T>: (item, index) => React.Key;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `item` | `T` |
| `index` | `number` |

#### Returns

`React.Key`

#### Source

[components/components/For.tsx:12](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/For.tsx#L12)

***

### MatchProps\<T\>

```ts
type MatchProps<T>: {
  children: RenderResult | (item) => RenderResult;
  when: T;
};
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyReactive`](index/README.md#anyreactive) |

#### Type declaration

##### children

```ts
children: RenderResult | (item) => RenderResult;
```

shouldn't change during the lifecycle of the component

##### when

```ts
when: T;
```

#### Source

[components/components/Switch.tsx:14](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Switch.tsx#L14)

***

### RenderResult

```ts
type RenderResult: React.ReactNode;
```

#### Source

[components/type.ts:1](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/type.ts#L1)

***

### ShowProps\<T\>

```ts
type ShowProps<T>: {
  children: RenderResult | (item) => RenderResult;
  fallback: RenderResult;
  when: T;
};
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`Reactive`](index/README.md#reactivet)\<`any`\> |

#### Type declaration

##### children

```ts
children: RenderResult | (item) => RenderResult;
```

##### fallback?

```ts
optional fallback: RenderResult;
```

##### when

```ts
when: T;
```

#### Source

[components/components/Show.tsx:9](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Show.tsx#L9)

***

### SwitchProps

```ts
type SwitchProps: {
  children: JSX.Element | JSX.Element[];
  fallback: RenderResult;
};
```

#### Type declaration

##### children

```ts
children: JSX.Element | JSX.Element[];
```

shouldn't change during the lifecycle of the component

##### fallback?

```ts
optional fallback: RenderResult;
```

shouldn't change during the lifecycle of the component

#### Source

[components/components/Switch.tsx:32](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Switch.tsx#L32)

## Functions

### Computed()

```ts
Computed(__namedParameters): Element
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`ComputedProps`](components.md#computedprops) |

#### Returns

`Element`

#### Use Signals

#### Source

[components/components/Computed.tsx:12](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Computed.tsx#L12)

***

### For()

```ts
For<T>(__namedParameters): Element
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`Reactive`](index/README.md#reactivet)\<`any`[]\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`ForProps`](components.md#forpropst)\<`T`\> |

#### Returns

`Element`

#### Use Signals

#### Source

[components/components/For.tsx:24](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/For.tsx#L24)

***

### Match()

```ts
Match<T>(_props): null
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyReactive`](index/README.md#anyreactive) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `_props` | [`MatchProps`](components.md#matchpropst)\<`T`\> |

#### Returns

`null`

#### Source

[components/components/Switch.tsx:26](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Switch.tsx#L26)

***

### Show()

```ts
Show<T>(props): Element
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`Reactive`](index/README.md#reactivet)\<`any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`ShowProps`](components.md#showpropst)\<`T`\> |

#### Returns

`Element`

#### Use Signals

#### Source

[components/components/Show.tsx:18](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Show.tsx#L18)

***

### Switch()

```ts
Switch(props): Element
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`SwitchProps`](components.md#switchprops) |

#### Returns

`Element`

#### Use Signals

#### Example

```ts
// when prop can be callback or signal
<Switch>
 <Match when={() => isLoading.value}>
   <Loader />
 </Match>
 <Match when={() => isError.value}>
   There are an error
 </Match>
 <Match when={() => data.value}>
   {(contentAccessor) => (
     contentAccessor().id === 10 ? 1 : 2
   )}
 </Match>
</Switch>
```

#### Source

[components/components/Switch.tsx:62](https://github.com/XantreDev/preact-signals/blob/b56c517/packages/utils/src/lib/components/components/Switch.tsx#L62)
