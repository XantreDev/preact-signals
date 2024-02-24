**Preact signals utils documentation** • [API](README.md)

***

[Preact signals utils documentation](README.md) / hocs

# hocs

## Interfaces

### ReactifyLiteFn

#### Extends

- `Fn`

#### Properties

##### [rawArgs]

```ts
[rawArgs]: unknown;
```

###### Inherited from

`Fn.[rawArgs]`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:28

##### arg0

```ts
arg0: never;
```

###### Inherited from

`Fn.arg0`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:30

##### arg1

```ts
arg1: never;
```

###### Inherited from

`Fn.arg1`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:31

##### arg2

```ts
arg2: never;
```

###### Inherited from

`Fn.arg2`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:32

##### arg3

```ts
arg3: never;
```

###### Inherited from

`Fn.arg3`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:33

##### args

```ts
args: never;
```

###### Inherited from

`Fn.args`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:29

##### return

```ts
return: never;
```

###### Overrides

`Fn.return`

###### Source

[hocs/reactifyLite.ts:21](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hocs/reactifyLite.ts#L21)

***

### WithSignalProp

#### Extends

- `Fn`

#### Properties

##### [rawArgs]

```ts
[rawArgs]: unknown;
```

###### Inherited from

`Fn.[rawArgs]`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:28

##### arg0

```ts
arg0: never;
```

###### Inherited from

`Fn.arg0`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:30

##### arg1

```ts
arg1: never;
```

###### Inherited from

`Fn.arg1`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:31

##### arg2

```ts
arg2: never;
```

###### Inherited from

`Fn.arg2`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:32

##### arg3

```ts
arg3: never;
```

###### Inherited from

`Fn.arg3`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:33

##### args

```ts
args: never;
```

###### Inherited from

`Fn.args`

###### Source

../../../../node\_modules/.pnpm/hotscript@1.0.13/node\_modules/hotscript/dist/internals/core/Core.d.ts:29

##### return

```ts
return: never;
```

###### Overrides

`Fn.return`

###### Source

[hocs/withSignalProps.ts:7](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hocs/withSignalProps.ts#L7)

## Type Aliases

### ReactiveProps\<T\>

```ts
type ReactiveProps<T>: Opaque<T, "reactify.reactive-props">;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `Record`\<`any`, `any`\> |

#### Source

[hocs/reactifyLite.ts:26](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hocs/reactifyLite.ts#L26)

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
| `TComponent` extends `ComponentType`\<`any`\> | `FC`\<`any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `component` | `TComponent` |

#### Returns

`ChangeComponentProps`\<`TComponent`, `Equal`\<`TComponent` extends `ElementType`\<`any`\> ? `ComponentPropsWithRef`\<`TComponent`\> : `never`, *typeof* `_`\> extends `true` ? [] : [`TComponent` extends `ElementType`\<`any`\> ? `ComponentPropsWithRef`\<`TComponent`\> : `never`] extends `args` ? `args` : `never` extends [`arg`, `...any[]`] ? `arg` : `never` extends [`ReactiveProps`](hocs.md#reactivepropst)\<`Record`\<`any`, `any`\>\> ? `MapValuesImpl`\<`UnwrapOpaque`\<`Record`\<`any`, `any`\> & `Tagged`\<`"reactify.reactive-props"`\> & `Equal`\<`TComponent` extends `ElementType`\<`any`\> ? `ComponentPropsWithRef`\<`TComponent`\> : `never`, *typeof* `_`\> extends `true` ? [] : [`TComponent` extends `ElementType`\<`any`\> ? `ComponentPropsWithRef`\<`TComponent`\> : `never`] extends `args` ? `args` : `never` extends [`arg`, `...any[]`] ? `arg` : `never`\>, [`WithSignalProp`](hocs.md#withsignalprop)\> : `never`\>

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

[hocs/reactifyLite.ts:122](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hocs/reactifyLite.ts#L122)

***

### withSignalProps()

```ts
withSignalProps<TComponent>(component): ChangeComponentProps<TComponent, MapValuesImpl<Equal<TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never, typeof _> extends true ? [] : [TComponent extends ElementType<any> ? ComponentPropsWithRef<TComponent> : never] extends args ? args : never extends [arg, ...any[]] ? arg : never, WithSignalProp>>
```

Allows to pass props to third party components that are not aware of signals. This will subscribe to signals on demand.

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TComponent` extends `ComponentType`\<`any`\> | `FC`\<`any`\> |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `component` | `TComponent` |

#### Returns

`ChangeComponentProps`\<`TComponent`, `MapValuesImpl`\<`Equal`\<`TComponent` extends `ElementType`\<`any`\> ? `ComponentPropsWithRef`\<`TComponent`\> : `never`, *typeof* `_`\> extends `true` ? [] : [`TComponent` extends `ElementType`\<`any`\> ? `ComponentPropsWithRef`\<`TComponent`\> : `never`] extends `args` ? `args` : `never` extends [`arg`, `...any[]`] ? `arg` : `never`, [`WithSignalProp`](hocs.md#withsignalprop)\>\>

#### Source

[hocs/withSignalProps.ts:43](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hocs/withSignalProps.ts#L43)
