**Preact signals utils documentation** • [API](README.md)

***

[Preact signals utils documentation](README.md) / hocs

# hocs

## Modules

- [\<internal\>](-internal--1.md)

## Interfaces

### ReactifyLiteFn

Base interface for all functions.

#### Description

You need to extend this interface to create a function
that can be composed with other HOTScript functions.
Usually you will just convert some utility type you already have
by wrapping it inside a HOTScript function.

Use `this['args']`, `this['arg0']`, `this['arg1']` etc to access
function arguments.

The `return` property is the value returned by your function.

#### Example

```ts
export interface CustomOmitFn extends Fn {
 return: Omit<this['arg0'], this['arg1']>
}

type T = Call<CustomOmitFn, { a, b, c }, 'a'> // { b, c }
```

#### Extends

- [`Fn`](-internal--1.md#fn)

#### Properties

##### [rawArgs]

```ts
[rawArgs]: unknown;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`[rawArgs]`](-internal--1.md#%5Brawargs%5D)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:28

##### arg0

```ts
arg0: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg0`](-internal--1.md#arg0)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:30

##### arg1

```ts
arg1: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg1`](-internal--1.md#arg1)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:31

##### arg2

```ts
arg2: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg2`](-internal--1.md#arg2)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:32

##### arg3

```ts
arg3: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg3`](-internal--1.md#arg3)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:33

##### args

```ts
args: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`args`](-internal--1.md#args)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:29

##### return

```ts
return: never;
```

###### Overrides

[`Fn`](-internal--1.md#fn).[`return`](-internal--1.md#return)

###### Source

[hocs/reactifyLite.ts:21](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/hocs/reactifyLite.ts#L21)

***

### WithSignalProp

Base interface for all functions.

#### Description

You need to extend this interface to create a function
that can be composed with other HOTScript functions.
Usually you will just convert some utility type you already have
by wrapping it inside a HOTScript function.

Use `this['args']`, `this['arg0']`, `this['arg1']` etc to access
function arguments.

The `return` property is the value returned by your function.

#### Example

```ts
export interface CustomOmitFn extends Fn {
 return: Omit<this['arg0'], this['arg1']>
}

type T = Call<CustomOmitFn, { a, b, c }, 'a'> // { b, c }
```

#### Extends

- [`Fn`](-internal--1.md#fn)

#### Properties

##### [rawArgs]

```ts
[rawArgs]: unknown;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`[rawArgs]`](-internal--1.md#%5Brawargs%5D)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:28

##### arg0

```ts
arg0: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg0`](-internal--1.md#arg0)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:30

##### arg1

```ts
arg1: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg1`](-internal--1.md#arg1)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:31

##### arg2

```ts
arg2: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg2`](-internal--1.md#arg2)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:32

##### arg3

```ts
arg3: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`arg3`](-internal--1.md#arg3)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:33

##### args

```ts
args: never;
```

###### Inherited from

[`Fn`](-internal--1.md#fn).[`args`](-internal--1.md#args)

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:29

##### return

```ts
return: never;
```

###### Overrides

[`Fn`](-internal--1.md#fn).[`return`](-internal--1.md#return)

###### Source

[hocs/withSignalProps.ts:7](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/hocs/withSignalProps.ts#L7)

## Type Aliases

### ReactiveProps\<T\>

```ts
type ReactiveProps<T>: Opaque<T, "reactify.reactive-props">;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`Record`](-internal--1.md#recordkt)\<`any`, `any`\> |

#### Source

[hocs/reactifyLite.ts:26](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/hocs/reactifyLite.ts#L26)

## Functions

### reactifyLite()

```ts
reactifyLite<TComponent>(component): ChangeComponentProps<TComponent, Equal<TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never, typeof _> extends true ? [] : [TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never] extends args ? args : never extends [arg, ...any[]] ? arg : never extends ReactiveProps<Record<any, any>> ? MapValuesImpl<UnwrapOpaque<Record<any, any> & Tagged<"reactify.reactive-props"> & Equal<TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never, typeof _> extends true ? [] : [TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never] extends args ? args : never extends [arg, ...any[]] ? arg : never>, WithSignalProp> : never>
```

### Allows to provide Signal/Uncached values as props.
under the hood each prop will be converted to reactive primitive, and after it props getters will be passed to the component.
Limitations:
* you should not destruct props in the component, because it will create extra re-renders
* you should not change references of reactive props
* functions passed as props are not reactive, so you should memoize them before passing. (in most cases it is not a problem)
Because of this limitations you should mark props as `ReactiveProps` to be sure that you aware of this.

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TComponent` extends [`ComponentType`](-internal--1.md#componenttypep)\<`any`\> | [`FC`](-internal--1.md#fcp)\<`any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `component` | `TComponent` |

#### Returns

[`ChangeComponentProps`](-internal--1.md#changecomponentpropstcomponenttnewprops)\<`TComponent`, [`Equal`](-internal--1.md#equalab)\<`TComponent` extends [`ElementType`](-internal--1.md#elementtypep)\<`any`\> ? [`ComponentPropsWithRef`](-internal--1.md#componentpropswithreft)\<`TComponent`\> : `never`, *typeof* [`_`](-internal--1.md#_-1)\> extends `true` ? [] : [`TComponent` extends [`ElementType`](-internal--1.md#elementtypep)\<`any`\> ? [`ComponentPropsWithRef`](-internal--1.md#componentpropswithreft)\<`TComponent`\> : `never`] extends `args` ? `args` : `never` extends [`arg`, `...any[]`] ? `arg` : `never` extends [`ReactiveProps`](hocs.md#reactivepropst)\<[`Record`](-internal--1.md#recordkt)\<`any`, `any`\>\> ? [`MapValuesImpl`](-internal--1.md#mapvaluesimpltfn)\<[`UnwrapOpaque`](-internal--1.md#unwrapopaqueopaquetype)\<[`Record`](-internal--1.md#recordkt)\<`any`, `any`\> & [`Tagged`](-internal--1.md#taggedtoken)\<`"reactify.reactive-props"`\> & [`Equal`](-internal--1.md#equalab)\<`TComponent` extends [`ElementType`](-internal--1.md#elementtypep)\<`any`\> ? [`ComponentPropsWithRef`](-internal--1.md#componentpropswithreft)\<`TComponent`\> : `never`, *typeof* [`_`](-internal--1.md#_-1)\> extends `true` ? [] : [`TComponent` extends [`ElementType`](-internal--1.md#elementtypep)\<`any`\> ? [`ComponentPropsWithRef`](-internal--1.md#componentpropswithreft)\<`TComponent`\> : `never`] extends `args` ? `args` : `never` extends [`arg`, `...any[]`] ? `arg` : `never`\>, [`WithSignalProp`](hocs.md#withsignalprop)\> : `never`\>

#### Example

```tsx
const Component = reactifyLite((props: ReactiveProps<{
  foo: string;
  bar: number;
}>) => {
  return <Show when={() => props.bar > 10}>{() => props.foo}</Show>;
});

const App = () => {
 const bar = useSignal(0);
 useEffect(() => {
  setTimeout(() => {
   bar.value = 20;
  }, 1000);
 }, []);

 return <Component foo="foo" bar={bar} />;
}
```

#### Source

[hocs/reactifyLite.ts:122](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/hocs/reactifyLite.ts#L122)

***

### withSignalProps()

```ts
withSignalProps<TComponent>(component): ChangeComponentProps<TComponent, MapValuesImpl<Equal<TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never, typeof _> extends true ? [] : [TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never] extends args ? args : never extends [arg, ...any[]] ? arg : never, WithSignalProp>>
```

Allows to pass props to third party components that are not aware of signals. This will subscribe to signals on demand.

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TComponent` extends [`ComponentType`](-internal--1.md#componenttypep)\<`any`\> | [`FC`](-internal--1.md#fcp)\<`any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `component` | `TComponent` |

#### Returns

[`ChangeComponentProps`](-internal--1.md#changecomponentpropstcomponenttnewprops)\<`TComponent`, [`MapValuesImpl`](-internal--1.md#mapvaluesimpltfn)\<[`Equal`](-internal--1.md#equalab)\<`TComponent` extends [`ElementType`](-internal--1.md#elementtypep)\<`any`\> ? [`ComponentPropsWithRef`](-internal--1.md#componentpropswithreft)\<`TComponent`\> : `never`, *typeof* [`_`](-internal--1.md#_-1)\> extends `true` ? [] : [`TComponent` extends [`ElementType`](-internal--1.md#elementtypep)\<`any`\> ? [`ComponentPropsWithRef`](-internal--1.md#componentpropswithreft)\<`TComponent`\> : `never`] extends `args` ? `args` : `never` extends [`arg`, `...any[]`] ? `arg` : `never`, [`WithSignalProp`](hocs.md#withsignalprop)\>\>

#### Source

[hocs/withSignalProps.ts:43](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/hocs/withSignalProps.ts#L43)
