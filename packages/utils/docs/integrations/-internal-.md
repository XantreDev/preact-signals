**Preact signals utils documentation** • [API](../README.md)

***

[Preact signals utils documentation](../README.md) / [integrations/reanimated](reanimated.md) / \<internal\>

# \<internal\>

## Enumerations

### ReduceMotion

#### Param

If the `Reduce motion` accessibility setting is enabled on the device, disable the animation. Otherwise, enable the animation.

#### Param

Disable the animation.

#### Param

Enable the animation.

#### See

https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility

#### Enumeration Members

##### Always

```ts
Always: "always";
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:178

##### Never

```ts
Never: "never";
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:179

##### System

```ts
System: "system";
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:177

## Interfaces

### SharedValue\<Value\>

A value that can be used both on the [JavaScript thread](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#javascript-thread) and the [UI thread](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#ui-thread).

Shared values are defined using [useSharedValue](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue) hook. You access and modify shared values by their `.value` property.

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `Value` | `unknown` |

#### Properties

##### addListener

```ts
addListener: (listenerID, listener) => void;
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `listenerID` | `number` |
| `listener` | (`value`) => `void` |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:15

##### modify

```ts
modify: (modifier?, forceUpdate?) => void;
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `modifier`? | \<`T`\>(`value`) => `T` |
| `forceUpdate`? | `boolean` |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:17

##### removeListener

```ts
removeListener: (listenerID) => void;
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `listenerID` | `number` |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:16

##### value

```ts
value: Value;
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:14

***

### TimingConfig

The timing animation configuration.

#### Param

Length of the animation (in milliseconds). Defaults to 300.

#### Param

An easing function which defines the animation curve. Defaults to `Easing.inOut(Easing.quad)`.

#### Param

Determines how the animation responds to the device's reduced motion accessibility setting. Default to `ReduceMotion.System` - [ReduceMotion](-internal-.md#reducemotion).

#### See

https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming#config-

#### Properties

##### duration?

```ts
optional duration: number;
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/animation/timing.d.ts:12

##### easing?

```ts
optional easing: EasingFunction | EasingFunctionFactory;
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/animation/timing.d.ts:14

##### reduceMotion?

```ts
optional reduceMotion: ReduceMotion;
```

###### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/animation/timing.d.ts:13

## Type Aliases

### Animatable

```ts
type Animatable: number | string | number[];
```

#### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:60

***

### AnimatableValue

```ts
type AnimatableValue: Animatable | AnimatableValueObject;
```

#### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:64

***

### AnimatableValueObject

```ts
type AnimatableValueObject: Object;
```

#### Index signature

 \[`key`: `string`\]: [`Animatable`](-internal-.md#animatable)

#### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/commonTypes.d.ts:61

***

### EasingFunction

```ts
type EasingFunction: (t) => number;
```

The `Easing` module implements common easing functions. This module is used
by [Animate.timing()](docs/animate.html#timing) to convey physically
believable motion in animations.

You can find a visualization of some common easing functions at
http://easings.net/

### Predefined animations

The `Easing` module provides several predefined animations through the
following methods:

- [`back`](docs/easing.html#back) provides a simple animation where the
  object goes slightly back before moving forward
- [`bounce`](docs/easing.html#bounce) provides a bouncing animation
- [`ease`](docs/easing.html#ease) provides a simple inertial animation
- [`elastic`](docs/easing.html#elastic) provides a simple spring interaction

### Standard functions

Three standard easing functions are provided:

- [`linear`](docs/easing.html#linear)
- [`quad`](docs/easing.html#quad)
- [`cubic`](docs/easing.html#cubic)

The [`poly`](docs/easing.html#poly) function can be used to implement
quartic, quintic, and other higher power functions.

### Additional functions

Additional mathematical functions are provided by the following methods:

- [`bezier`](docs/easing.html#bezier) provides a cubic bezier curve
- [`circle`](docs/easing.html#circle) provides a circular function
- [`sin`](docs/easing.html#sin) provides a sinusoidal function
- [`exp`](docs/easing.html#exp) provides an exponential function

The following helpers are used to modify other easing functions.

- [`in`](docs/easing.html#in) runs an easing function forwards
- [`inOut`](docs/easing.html#inout) makes any easing function symmetrical
- [`out`](docs/easing.html#out) runs an easing function backwards

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `t` | `number` |

#### Returns

`number`

#### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/Easing.d.ts:46

***

### EasingFunctionFactory

```ts
type EasingFunctionFactory: Object;
```

#### Type declaration

##### factory

```ts
factory: () => EasingFunction;
```

###### Returns

[`EasingFunction`](-internal-.md#easingfunction)

#### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/Easing.d.ts:51

***

### SpringConfig

```ts
type SpringConfig: Object & Object | Object;
```

Spring animation configuration.

#### Param

The weight of the spring. Reducing this value makes the animation faster. Defaults to 1.

#### Param

How quickly a spring slows down. Higher damping means the spring will come to rest faster. Defaults to 10.

#### Param

Length of the animation (in milliseconds). Defaults to 2000.

#### Param

How damped the spring is. Value 1 means the spring is critically damped, and value \>1 means the spring is overdamped. Defaults to 0.5.

#### Param

How bouncy the spring is. Defaults to 100.

#### Param

Initial velocity applied to the spring equation. Defaults to 0.

#### Param

Whether a spring can bounce over the `toValue`. Defaults to false.

#### Param

The displacement below which the spring will snap to toValue without further oscillations. Defaults to 0.01.

#### Param

The speed in pixels per second from which the spring will snap to toValue without further oscillations. Defaults to 2.

#### Param

Determines how the animation responds to the device's reduced motion accessibility setting. Default to `ReduceMotion.System` - [ReduceMotion](-internal-.md#reducemotion).

#### See

https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/#config-

#### Type declaration

##### overshootClamping?

```ts
optional overshootClamping: boolean;
```

##### reduceMotion?

```ts
optional reduceMotion: ReduceMotion;
```

##### restDisplacementThreshold?

```ts
optional restDisplacementThreshold: number;
```

##### restSpeedThreshold?

```ts
optional restSpeedThreshold: number;
```

##### stiffness?

```ts
optional stiffness: number;
```

##### velocity?

```ts
optional velocity: number;
```

#### Source

../../../../node\_modules/.pnpm/react-native-reanimated@3.7.0\_@babel+core@7.23.9\_@babel+plugin-proposal-nullish-coalescing-op\_r24qbne7oiqnwyjgauyf4jazhq/node\_modules/react-native-reanimated/lib/typescript/reanimated2/animation/springUtils.d.ts:17
