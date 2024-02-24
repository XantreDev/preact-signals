**Preact signals utils documentation** • [API](../README.md)

***

[Preact signals utils documentation](../README.md) / integrations/reanimated

# integrations/reanimated

## Modules

- [\<internal\>](-internal-.md)

## Type Aliases

### SharedValueSetter\<T\>

```ts
type SharedValueSetter<T>: SignalInteropSetter<SharedValue<T>, T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[integrations/reanimated.ts:100](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L100)

***

### SignalInteropSetter\<TTarget, TSource\>

```ts
type SignalInteropSetter<TTarget, TSource>: (target, source) => unknown;
```

#### Type parameters

| Type parameter |
| :------ |
| `TTarget` |
| `TSource` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `target` | `TTarget` |
| `source` | `TSource` |

#### Returns

`unknown`

#### Source

[integrations/reanimated.ts:96](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L96)

## Functions

### useAnimatedSharedValueOfAccessor()

```ts
useAnimatedSharedValueOfAccessor<T>(accessor, animateOptions): Readonly<SharedValue<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnimatableValue`](-internal-.md#animatablevalue) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `accessor` | () => `T` |
| `animateOptions` | `Object` \| `Object` |

#### Returns

[`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\>

#### Description

applies withSpring or withTiming to shared value of accessor

#### Example

```tsx
const maxLength = 10
function ExampleComponent() {
 const input = useSignal('')
 const progress = useAnimatedSharedValueOfAccessor(
  () => input.value.length / maxLength,
  {
    type: 'spring',
    params: {
      damping: 10,
    }
 })

 return (
   <View>
     <CustomInput value={input} onChangeText={(v) => input.value = v} />
     <Animated.View style={useAnimatedStyle(() => ({
      alignSelf: 'stretch',
      height: 10,
      transform: [{ scaleX: progress.value }],
    }))} />
   </View>
 );
}
```

#### Source

[integrations/reanimated.ts:146](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L146)

***

### useComputedOfSharedValue()

```ts
useComputedOfSharedValue<T, TResult>(shared, compute): ReadonlySignal<TResult>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |
| `TResult` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `shared` | [`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\> |
| `compute` | (`v`) => `TResult` |

#### Returns

[`ReadonlySignal`](../-internal--1.md#readonlysignalt)\<`TResult`\>

#### Source

[integrations/reanimated.ts:52](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L52)

***

### useSharedValueOfAccessor()

```ts
useSharedValueOfAccessor<T>(accessor, setter): Readonly<SharedValue<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Default value |
| :------ | :------ | :------ |
| `accessor` | () => `T` | `undefined` |
| `setter` | [`SharedValueSetter`](reanimated.md#sharedvaluesettert)\<`T`\> | `defaultSharedValueSetter` |

#### Returns

[`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\>

#### Source

[integrations/reanimated.ts:101](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L101)

***

### useSharedValueOfSignal()

```ts
useSharedValueOfSignal<T>(_sig): Readonly<SharedValue<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `_sig` | [`ReadonlySignal`](../-internal--1.md#readonlysignalt)\<`T`\> |

#### Returns

[`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\>

#### Description

creates a shared value from a signal.

#### Example

```tsx
function ExampleComponent() {
  const signal = useSignal(0);
  const sharedValue = useSharedValueOfSignal(signal);

  // Now you can use the shared value in your component
  // ...

  return <Animated.View style={useAnimatedStyle(() => ({
    opacity: sharedValue.value,
   }))} />;
}
```

#### Source

[integrations/reanimated.ts:79](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L79)

***

### useSignalOfSharedValue()

```ts
useSignalOfSharedValue<T>(shared): ReadonlySignal<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `shared` | [`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\> |

#### Returns

[`ReadonlySignal`](../-internal--1.md#readonlysignalt)\<`T`\>

#### Example

```tsx
import { useSharedValue } from "react-native-reanimated";
import { useSignalOfSharedValue } from "@preact-signals/utils/integrations/reanimated";

function ExampleComponent() {
  const sharedValue = useSharedValue(0);
  const signal = useSignalOfSharedValue(sharedValue);

  useSignalEffect(() => {
    // running some code on JS thread
  })

 // ... rest of the component
}
```

#### Source

[integrations/reanimated.ts:38](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L38)

***

### useSpringSharedValueOfAccessor()

```ts
useSpringSharedValueOfAccessor<T>(accessor, params?): Readonly<SharedValue<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnimatableValue`](-internal-.md#animatablevalue) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `accessor` | () => `T` |
| `params`? | [`SpringConfig`](-internal-.md#springconfig) |

#### Returns

[`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\>

#### Source

[integrations/reanimated.ts:168](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L168)

***

### useTimingSharedValueOfAccessor()

```ts
useTimingSharedValueOfAccessor<T>(accessor, params?): Readonly<SharedValue<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnimatableValue`](-internal-.md#animatablevalue) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `accessor` | () => `T` |
| `params`? | [`TimingConfig`](-internal-.md#timingconfig) |

#### Returns

[`Readonly`](../index/-internal-.md#readonlyt)\<[`SharedValue`](-internal-.md#sharedvaluevalue)\<`T`\>\>

#### Source

[integrations/reanimated.ts:177](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/integrations/reanimated.ts#L177)
