**Preact signals utils documentation** • [API](README.md)

***

[Preact signals utils documentation](README.md) / [hooks](hooks.md) / \<internal\>

# \<internal\>

## Object

### Except\<ObjectType, KeysType, Options\>

```ts
type Except<ObjectType, KeysType, Options>: { [KeyType in keyof ObjectType as Filter<KeyType, KeysType>]: ObjectType[KeyType] } & Options["requireExactProps"] extends true ? Partial<Record<KeysType, never>> : Object;
```

Create a type from an object type without certain keys.

We recommend setting the `requireExactProps` option to `true`.

This type is a stricter version of [`Omit`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type). The `Omit` type does not restrict the omitted keys to be keys present on the given type, while `Except` does. The benefits of a stricter type are avoiding typos and allowing the compiler to pick up on rename refactors automatically.

This type was proposed to the TypeScript team, which declined it, saying they prefer that libraries implement stricter versions of the built-in types ([microsoft/TypeScript#30825](https://github.com/microsoft/TypeScript/issues/30825#issuecomment-523668235)).

#### Example

```
import type {Except} from 'type-fest';

type Foo = {
	a: number;
	b: string;
};

type FooWithoutA = Except<Foo, 'a'>;
//=> {b: string}

const fooWithoutA: FooWithoutA = {a: 1, b: '2'};
//=> errors: 'a' does not exist in type '{ b: string; }'

type FooWithoutB = Except<Foo, 'b', {requireExactProps: true}>;
//=> {a: number} & Partial<Record<"b", never>>

const fooWithoutB: FooWithoutB = {a: 1, b: '2'};
//=> errors at 'b': Type 'string' is not assignable to type 'undefined'.
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `ObjectType` | - |
| `KeysType` extends keyof `ObjectType` | - |
| `Options` extends [`ExceptOptions`](-internal--1.md#exceptoptions) | `Object` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/except.d.ts:76

***

### SetReadonly\<BaseType, Keys\>

```ts
type SetReadonly<BaseType, Keys>: BaseType extends unknown ? Simplify<Except<BaseType, Keys> & Readonly<Pick<BaseType, Keys>>> : never;
```

Create a type that makes the given keys readonly. The remaining keys are kept as is.

Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are readonly.

#### Example

```
import type {SetReadonly} from 'type-fest';

type Foo = {
	a: number;
	readonly b: string;
	c: boolean;
}

type SomeReadonly = SetReadonly<Foo, 'b' | 'c'>;
// type SomeReadonly = {
// 	a: number;
// 	readonly b: string; // Was already readonly and still is.
// 	readonly c: boolean; // Is now readonly.
// }
```

#### Type parameters

| Type parameter |
| :------ |
| `BaseType` |
| `Keys` extends keyof `BaseType` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/set-readonly.d.ts:29

***

### Simplify\<T\>

```ts
type Simplify<T>: { [KeyType in keyof T]: T[KeyType] } & Object;
```

Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.

#### Example

```
import type {Simplify} from 'type-fest';

type PositionProps = {
	top: number;
	left: number;
};

type SizeProps = {
	width: number;
	height: number;
};

// In your editor, hovering over `Props` will show a flattened object with all the properties.
type Props = Simplify<PositionProps & SizeProps>;
```

Sometimes it is desired to pass a value as a function argument that has a different type. At first inspection it may seem assignable, and then you discover it is not because the `value`'s type definition was defined as an interface. In the following example, `fn` requires an argument of type `Record<string, unknown>`. If the value is defined as a literal, then it is assignable. And if the `value` is defined as type using the `Simplify` utility the value is assignable.  But if the `value` is defined as an interface, it is not assignable because the interface is not sealed and elsewhere a non-string property could be added to the interface.

If the type definition must be an interface (perhaps it was defined in a third-party npm package), then the `value` can be defined as `const value: Simplify<SomeInterface> = ...`. Then `value` will be assignable to the `fn` argument.  Or the `value` can be cast as `Simplify<SomeInterface>` if you can't re-declare the `value`.

#### Example

```
import type {Simplify} from 'type-fest';

interface SomeInterface {
	foo: number;
	bar?: string;
	baz: number | undefined;
}

type SomeType = {
	foo: number;
	bar?: string;
	baz: number | undefined;
};

const literal = {foo: 123, bar: 'hello', baz: 456};
const someType: SomeType = literal;
const someInterface: SomeInterface = literal;

function fn(object: Record<string, unknown>): void {}

fn(literal); // Good: literal object type is sealed
fn(someType); // Good: type is sealed
fn(someInterface); // Error: Index signature for type 'string' is missing in type 'someInterface'. Because `interface` can be re-opened
fn(someInterface as Simplify<SomeInterface>); // Good: transform an `interface` into a `type`
```

#### Link

https://github.com/microsoft/TypeScript/issues/15300

#### Type declaration

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/simplify.d.ts:58

## Other

### ReadonlySignal\<T\>

#### Extends

- `Signal`\<`T`\>

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | `any` |

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

##### value

```ts
readonly value: T;
```

###### Overrides

`Signal.value`

###### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:17

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

### AnyRecord

```ts
type AnyRecord: Record<any, any>;
```

#### Source

[flat-store/setter.ts:5](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/flat-store/setter.ts#L5)

***

### Dispose

```ts
type Dispose: () => void;
```

#### Returns

`void`

#### Source

[utils/reaction.ts:9](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/utils/reaction.ts#L9)

***

### Dispose

```ts
type Dispose: () => void;
```

#### Returns

`void`

#### Source

[hooks/utility.ts:54](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/hooks/utility.ts#L54)

***

### ExceptOptions

```ts
type ExceptOptions: Object;
```

#### Type declaration

##### requireExactProps?

```ts
optional requireExactProps: boolean;
```

Disallow assigning non-specified properties.

Note that any omitted properties in the resulting type will be present in autocomplete as `undefined`.

###### Default

```ts
false
```

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/except.d.ts:32

***

### Filter\<KeyType, ExcludeType\>

```ts
type Filter<KeyType, ExcludeType>: IsEqual<KeyType, ExcludeType> extends true ? never : KeyType extends ExcludeType ? never : KeyType;
```

Filter out keys from an object.

Returns `never` if `Exclude` is strictly equal to `Key`.
Returns `never` if `Key` extends `Exclude`.
Returns `Key` otherwise.

#### Example

```
type Filtered = Filter<'foo', 'foo'>;
//=> never
```

#### Example

```
type Filtered = Filter<'bar', string>;
//=> never
```

#### Example

```
type Filtered = Filter<'bar', 'foo'>;
//=> 'bar'
```

#### See

#### Type parameters

| Type parameter |
| :------ |
| `KeyType` |
| `ExcludeType` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/except.d.ts:30

***

### FlatStoreSetter\<T\>

```ts
type FlatStoreSetter<T>: (newValue) => void;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyRecord`](-internal--1.md#anyrecord) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `newValue` | [`Partial`](-internal--1.md#partialt)\<[`Except`](-internal--1.md#exceptobjecttypekeystypeoptions)\<`T`, [`ReadonlyKeysOf`](-internal--1.md#readonlykeysoft)\<`T`\>\>\> |

#### Returns

`void`

#### Source

[flat-store/setter.ts:10](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/flat-store/setter.ts#L10)

***

### NonNullable\<T\>

```ts
type NonNullable<T>: T & Object;
```

Exclude null and undefined from T

#### Type declaration

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es5.d.ts:1627

***

### Partial\<T\>

```ts
type Partial<T>: { [P in keyof T]?: T[P] };
```

Make all properties in T optional

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es5.d.ts:1577

***

### ReactionDispose

```ts
type ReactionDispose: () => void;
```

Reaction dispose callback, that executes when deps function is rotten

#### Returns

`void`

#### Source

[utils/reaction.ts:97](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/utils/reaction.ts#L97)

***

### ReactionOptions

```ts
type ReactionOptions: Partial<Object | Object>;
```

#### Source

[utils/reaction.ts:10](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/utils/reaction.ts#L10)

***

### Record\<K, T\>

```ts
type Record<K, T>: { [P in K]: T };
```

Construct a type with a set of properties K of type T

#### Type parameters

| Type parameter |
| :------ |
| `K` extends keyof `any` |
| `T` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es5.d.ts:1605

## Type Guard

### IfNever\<T, TypeIfNever, TypeIfNotNever\>

```ts
type IfNever<T, TypeIfNever, TypeIfNotNever>: IsNever<T> extends true ? TypeIfNever : TypeIfNotNever;
```

An if-else-like type that resolves depending on whether the given type is `never`.

#### See

[IsNever](-internal--1.md#isnevert)

#### Example

```
import type {IfNever} from 'type-fest';

type ShouldBeTrue = IfNever<never>;
//=> true

type ShouldBeBar = IfNever<'not never', 'foo', 'bar'>;
//=> 'bar'
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | - |
| `TypeIfNever` | `true` |
| `TypeIfNotNever` | `false` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/if-never.d.ts:22

***

### IsEqual\<A, B\>

```ts
type IsEqual<A, B>: <G>() => G extends A ? 1 : 2 extends <G>() => G extends B ? 1 : 2 ? true : false;
```

Returns a boolean for whether the two given types are equal.

#### Link

https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650

#### Link

https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796

Use-cases:
- If you want to make a conditional branch based on the result of a comparison of two types.

#### Example

```
import type {IsEqual} from 'type-fest';

// This type returns a boolean for whether the given array includes the given item.
// `IsEqual` is used to compare the given array at position 0 and the given item and then return true if they are equal.
type Includes<Value extends readonly any[], Item> =
	Value extends readonly [Value[0], ...infer rest]
		? IsEqual<Value[0], Item> extends true
			? true
			: Includes<rest, Item>
		: false;
```

#### Type parameters

| Type parameter |
| :------ |
| `A` |
| `B` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/is-equal.d.ts:27

***

### IsNever\<T\>

```ts
type IsNever<T>: [T] extends [never] ? true : false;
```

Returns a boolean for whether the given type is `never`.

#### Link

https://github.com/microsoft/TypeScript/issues/31751#issuecomment-498526919

#### Link

https://stackoverflow.com/a/53984913/10292952

#### Link

https://www.zhenghao.io/posts/ts-never

Useful in type utilities, such as checking if something does not occur.

#### Example

```
import type {IsNever} from 'type-fest';

type And<A, B> =
	A extends true
		? B extends true
			? true
			: false
		: false;

// https://github.com/andnp/SimplyTyped/blob/master/src/types/strings.ts
type AreStringsEqual<A extends string, B extends string> =
	And<
		IsNever<Exclude<A, B>> extends true ? true : false,
		IsNever<Exclude<B, A>> extends true ? true : false
	>;

type EndIfEqual<I extends string, O extends string> =
	AreStringsEqual<I, O> extends true
		? never
		: void;

function endIfEqual<I extends string, O extends string>(input: I, output: O): EndIfEqual<I, O> {
	if (input === output) {
		process.exit(0);
	}
}

endIfEqual('abc', 'abc');
//=> never

endIfEqual('abc', '123');
//=> void
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/is-never.d.ts:49

## Utilities

### IfNever\<T, TypeIfNever, TypeIfNotNever\>

```ts
type IfNever<T, TypeIfNever, TypeIfNotNever>: IsNever<T> extends true ? TypeIfNever : TypeIfNotNever;
```

An if-else-like type that resolves depending on whether the given type is `never`.

#### See

[IsNever](-internal--1.md#isnevert)

#### Example

```
import type {IfNever} from 'type-fest';

type ShouldBeTrue = IfNever<never>;
//=> true

type ShouldBeBar = IfNever<'not never', 'foo', 'bar'>;
//=> 'bar'
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | - |
| `TypeIfNever` | `true` |
| `TypeIfNotNever` | `false` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/if-never.d.ts:22

***

### IsEqual\<A, B\>

```ts
type IsEqual<A, B>: <G>() => G extends A ? 1 : 2 extends <G>() => G extends B ? 1 : 2 ? true : false;
```

Returns a boolean for whether the two given types are equal.

#### Link

https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650

#### Link

https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796

Use-cases:
- If you want to make a conditional branch based on the result of a comparison of two types.

#### Example

```
import type {IsEqual} from 'type-fest';

// This type returns a boolean for whether the given array includes the given item.
// `IsEqual` is used to compare the given array at position 0 and the given item and then return true if they are equal.
type Includes<Value extends readonly any[], Item> =
	Value extends readonly [Value[0], ...infer rest]
		? IsEqual<Value[0], Item> extends true
			? true
			: Includes<rest, Item>
		: false;
```

#### Type parameters

| Type parameter |
| :------ |
| `A` |
| `B` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/is-equal.d.ts:27

***

### IsNever\<T\>

```ts
type IsNever<T>: [T] extends [never] ? true : false;
```

Returns a boolean for whether the given type is `never`.

#### Link

https://github.com/microsoft/TypeScript/issues/31751#issuecomment-498526919

#### Link

https://stackoverflow.com/a/53984913/10292952

#### Link

https://www.zhenghao.io/posts/ts-never

Useful in type utilities, such as checking if something does not occur.

#### Example

```
import type {IsNever} from 'type-fest';

type And<A, B> =
	A extends true
		? B extends true
			? true
			: false
		: false;

// https://github.com/andnp/SimplyTyped/blob/master/src/types/strings.ts
type AreStringsEqual<A extends string, B extends string> =
	And<
		IsNever<Exclude<A, B>> extends true ? true : false,
		IsNever<Exclude<B, A>> extends true ? true : false
	>;

type EndIfEqual<I extends string, O extends string> =
	AreStringsEqual<I, O> extends true
		? never
		: void;

function endIfEqual<I extends string, O extends string>(input: I, output: O): EndIfEqual<I, O> {
	if (input === output) {
		process.exit(0);
	}
}

endIfEqual('abc', 'abc');
//=> never

endIfEqual('abc', '123');
//=> void
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/is-never.d.ts:49

***

### ReadonlyKeysOf\<T\>

```ts
type ReadonlyKeysOf<T>: NonNullable<{ [P in keyof T]: IsEqual<{ [Q in P]: T[P] }, { readonly [Q in P]: T[P] }> extends true ? P : never }[keyof T]>;
```

Extract all readonly keys from the given type.

This is useful when you want to create a new type that contains readonly keys only.

#### Example

```
import type {ReadonlyKeysOf} from 'type-fest';

interface User {
	name: string;
	surname: string;
	readonly id: number;
}

type UpdateResponse<Entity extends object> = Pick<Entity, ReadonlyKeysOf<Entity>>;

const update1: UpdateResponse<User> = {
    id: 123,
};
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/type-fest@3.13.1/node\_modules/type-fest/source/readonly-keys-of.d.ts:27
