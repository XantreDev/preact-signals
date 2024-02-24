**Preact signals utils documentation** • [API](../README.md)

***

[Preact signals utils documentation](../README.md) / [index](README.md) / \<internal\>

# \<internal\>

## Classes

### Component\<P, S, SS\>

#### Extends

- [`ComponentLifecycle`](-internal-.md#componentlifecyclepsss)\<`P`, `S`, `SS`\>

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `P` | `Object` |
| `S` | `Object` |
| `SS` | `any` |

#### Constructors

##### new Component(props)

```ts
new Component<P, S, SS>(props): Component<P, S, SS>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | `P` \| [`Readonly`](-internal-.md#readonlyt)\<`P`\> |

###### Returns

[`Component`](-internal-.md#componentpsss)\<`P`, `S`, `SS`\>

###### Inherited from

`ComponentLifecycle<P, S, SS>.constructor`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:519

##### new Component(props, context)

```ts
new Component<P, S, SS>(props, context): Component<P, S, SS>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | `P` |
| `context` | `any` |

###### Returns

[`Component`](-internal-.md#componentpsss)\<`P`, `S`, `SS`\>

###### Inherited from

`ComponentLifecycle<P, S, SS>.constructor`

###### Deprecated

###### See

https://legacy.reactjs.org/docs/legacy-context.html

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:524

#### Properties

##### context

```ts
context: unknown;
```

If using the new style context, re-declare this in your class to be the
`React.ContextType` of your `static contextType`.
Should be used with type annotation or static contextType.

```ts
static contextType = MyContext
// For TS pre-3.7:
context!: React.ContextType<typeof MyContext>
// For TS 3.7 and above:
declare context: React.ContextType<typeof MyContext>
```

###### See

https://react.dev/reference/react/Component#context

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:517

##### props

```ts
readonly props: Readonly<P>;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:537

##### ~~refs~~

```ts
refs: Object;
```

###### Deprecated

https://legacy.reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

###### Index signature

 \[`key`: `string`\]: [`ReactInstance`](-internal-.md#reactinstance)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:543

##### state

```ts
state: Readonly<S>;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:538

##### contextType?

```ts
static optional contextType: Context<any>;
```

If set, `this.context` will be set at runtime to the current value of the given Context.

Usage:

```ts
type MyContext = number
const Ctx = React.createContext<MyContext>(0)

class Foo extends React.Component {
  static contextType = Ctx
  context!: React.ContextType<typeof Ctx>
  render () {
    return <>My context's value: {this.context}</>;
  }
}
```

###### See

https://react.dev/reference/react/Component#static-contexttype

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:500

#### Methods

##### ~~UNSAFE\_componentWillMount()?~~

```ts
optional UNSAFE_componentWillMount(): void
```

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`UNSAFE_componentWillMount`](-internal-.md#unsafe_componentwillmount-1)

###### Deprecated

16.3, use componentDidMount or the constructor instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:734

##### ~~UNSAFE\_componentWillReceiveProps()?~~

```ts
optional UNSAFE_componentWillReceiveProps(nextProps, nextContext): void
```

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`UNSAFE_componentWillReceiveProps`](-internal-.md#unsafe_componentwillreceiveprops-1)

###### Deprecated

16.3, use static getDerivedStateFromProps instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:766

##### ~~UNSAFE\_componentWillUpdate()?~~

```ts
optional UNSAFE_componentWillUpdate(
   nextProps, 
   nextState, 
   nextContext): void
```

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`UNSAFE_componentWillUpdate`](-internal-.md#unsafe_componentwillupdate-1)

###### Deprecated

16.3, use getSnapshotBeforeUpdate instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:794

##### componentDidCatch()?

```ts
optional componentDidCatch(error, errorInfo): void
```

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `error` | `Error` |
| `errorInfo` | [`ErrorInfo`](-internal-.md#errorinfo) |

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentDidCatch`](-internal-.md#componentdidcatch-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:663

##### componentDidMount()?

```ts
optional componentDidMount(): void
```

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentDidMount`](-internal-.md#componentdidmount-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:642

##### componentDidUpdate()?

```ts
optional componentDidUpdate(
   prevProps, 
   prevState, 
   snapshot?): void
```

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `prevProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `prevState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `snapshot`? | `SS` |

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentDidUpdate`](-internal-.md#componentdidupdate-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:705

##### ~~componentWillMount()?~~

```ts
optional componentWillMount(): void
```

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentWillMount`](-internal-.md#componentwillmount-1)

###### Deprecated

16.3, use componentDidMount or the constructor instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:720

##### ~~componentWillReceiveProps()?~~

```ts
optional componentWillReceiveProps(nextProps, nextContext): void
```

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentWillReceiveProps`](-internal-.md#componentwillreceiveprops-1)

###### Deprecated

16.3, use static getDerivedStateFromProps instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:749

##### componentWillUnmount()?

```ts
optional componentWillUnmount(): void
```

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentWillUnmount`](-internal-.md#componentwillunmount-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:658

##### ~~componentWillUpdate()?~~

```ts
optional componentWillUpdate(
   nextProps, 
   nextState, 
   nextContext): void
```

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`componentWillUpdate`](-internal-.md#componentwillupdate-1)

###### Deprecated

16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:779

##### forceUpdate()

```ts
forceUpdate(callback?): void
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `callback`? | () => `void` |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:534

##### getSnapshotBeforeUpdate()?

```ts
optional getSnapshotBeforeUpdate(prevProps, prevState): null | SS
```

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `prevProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `prevState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |

###### Returns

`null` \| `SS`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`getSnapshotBeforeUpdate`](-internal-.md#getsnapshotbeforeupdate-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:699

##### render()

```ts
render(): ReactNode
```

###### Returns

[`ReactNode`](-internal-.md#reactnode)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:535

##### setState()

```ts
setState<K>(state, callback?): void
```

###### Type parameters

| Type parameter |
| :------ |
| `K` extends `string` \| `number` \| `symbol` |

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `state` | `null` \| `S` \| (`prevState`, `props`) => `null` \| `S` \| [`Pick`](-internal-.md#picktk)\<`S`, `K`\> \| [`Pick`](-internal-.md#picktk)\<`S`, `K`\> |
| `callback`? | () => `void` |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:529

##### shouldComponentUpdate()?

```ts
optional shouldComponentUpdate(
   nextProps, 
   nextState, 
   nextContext): boolean
```

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`boolean`

###### Inherited from

[`ComponentLifecycle`](-internal-.md#componentlifecyclepsss).[`shouldComponentUpdate`](-internal-.md#shouldcomponentupdate-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:653

## Interfaces

### ComponentLifecycle\<P, S, SS\>

#### Extends

- [`NewLifecycle`](-internal-.md#newlifecyclepsss)\<`P`, `S`, `SS`\>.[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps)\<`P`, `S`\>

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `P` | - |
| `S` | - |
| `SS` | `any` |

#### Methods

##### ~~UNSAFE\_componentWillMount()?~~

```ts
optional UNSAFE_componentWillMount(): void
```

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Returns

`void`

###### Inherited from

[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps).[`UNSAFE_componentWillMount`](-internal-.md#unsafe_componentwillmount-2)

###### Deprecated

16.3, use componentDidMount or the constructor instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:734

##### ~~UNSAFE\_componentWillReceiveProps()?~~

```ts
optional UNSAFE_componentWillReceiveProps(nextProps, nextContext): void
```

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps).[`UNSAFE_componentWillReceiveProps`](-internal-.md#unsafe_componentwillreceiveprops-2)

###### Deprecated

16.3, use static getDerivedStateFromProps instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:766

##### ~~UNSAFE\_componentWillUpdate()?~~

```ts
optional UNSAFE_componentWillUpdate(
   nextProps, 
   nextState, 
   nextContext): void
```

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps).[`UNSAFE_componentWillUpdate`](-internal-.md#unsafe_componentwillupdate-2)

###### Deprecated

16.3, use getSnapshotBeforeUpdate instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:794

##### componentDidCatch()?

```ts
optional componentDidCatch(error, errorInfo): void
```

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `error` | `Error` |
| `errorInfo` | [`ErrorInfo`](-internal-.md#errorinfo) |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:663

##### componentDidMount()?

```ts
optional componentDidMount(): void
```

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:642

##### componentDidUpdate()?

```ts
optional componentDidUpdate(
   prevProps, 
   prevState, 
   snapshot?): void
```

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `prevProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `prevState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `snapshot`? | `SS` |

###### Returns

`void`

###### Inherited from

[`NewLifecycle`](-internal-.md#newlifecyclepsss).[`componentDidUpdate`](-internal-.md#componentdidupdate-2)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:705

##### ~~componentWillMount()?~~

```ts
optional componentWillMount(): void
```

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Returns

`void`

###### Inherited from

[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps).[`componentWillMount`](-internal-.md#componentwillmount-2)

###### Deprecated

16.3, use componentDidMount or the constructor instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:720

##### ~~componentWillReceiveProps()?~~

```ts
optional componentWillReceiveProps(nextProps, nextContext): void
```

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps).[`componentWillReceiveProps`](-internal-.md#componentwillreceiveprops-2)

###### Deprecated

16.3, use static getDerivedStateFromProps instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:749

##### componentWillUnmount()?

```ts
optional componentWillUnmount(): void
```

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:658

##### ~~componentWillUpdate()?~~

```ts
optional componentWillUpdate(
   nextProps, 
   nextState, 
   nextContext): void
```

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Inherited from

[`DeprecatedLifecycle`](-internal-.md#deprecatedlifecycleps).[`componentWillUpdate`](-internal-.md#componentwillupdate-2)

###### Deprecated

16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:779

##### getSnapshotBeforeUpdate()?

```ts
optional getSnapshotBeforeUpdate(prevProps, prevState): null | SS
```

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `prevProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `prevState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |

###### Returns

`null` \| `SS`

###### Inherited from

[`NewLifecycle`](-internal-.md#newlifecyclepsss).[`getSnapshotBeforeUpdate`](-internal-.md#getsnapshotbeforeupdate-2)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:699

##### shouldComponentUpdate()?

```ts
optional shouldComponentUpdate(
   nextProps, 
   nextState, 
   nextContext): boolean
```

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`boolean`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:653

***

### ConsumerProps\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Properties

##### children

```ts
children: (value) => ReactNode;
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

###### Returns

[`ReactNode`](-internal-.md#reactnode)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:378

***

### Context\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Properties

##### Consumer

```ts
Consumer: Consumer<T>;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:415

##### Provider

```ts
Provider: Provider<T>;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:414

##### displayName?

```ts
optional displayName: string;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:416

***

### DO\_NOT\_USE\_OR\_YOU\_WILL\_BE\_FIRED\_EXPERIMENTAL\_REACT\_NODES

For internal usage only.
Different release channels declare additional types of ReactNode this particular release channel accepts.
App or library types should never augment this interface.

***

### DeprecatedLifecycle\<P, S\>

#### Extended by

- [`ComponentLifecycle`](-internal-.md#componentlifecyclepsss)

#### Type parameters

| Type parameter |
| :------ |
| `P` |
| `S` |

#### Methods

##### ~~UNSAFE\_componentWillMount()?~~

```ts
optional UNSAFE_componentWillMount(): void
```

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Returns

`void`

###### Deprecated

16.3, use componentDidMount or the constructor instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:734

##### ~~UNSAFE\_componentWillReceiveProps()?~~

```ts
optional UNSAFE_componentWillReceiveProps(nextProps, nextContext): void
```

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Deprecated

16.3, use static getDerivedStateFromProps instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:766

##### ~~UNSAFE\_componentWillUpdate()?~~

```ts
optional UNSAFE_componentWillUpdate(
   nextProps, 
   nextState, 
   nextContext): void
```

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Deprecated

16.3, use getSnapshotBeforeUpdate instead

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:794

##### ~~componentWillMount()?~~

```ts
optional componentWillMount(): void
```

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Returns

`void`

###### Deprecated

16.3, use componentDidMount or the constructor instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:720

##### ~~componentWillReceiveProps()?~~

```ts
optional componentWillReceiveProps(nextProps, nextContext): void
```

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Deprecated

16.3, use static getDerivedStateFromProps instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:749

##### ~~componentWillUpdate()?~~

```ts
optional componentWillUpdate(
   nextProps, 
   nextState, 
   nextContext): void
```

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `nextProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `nextState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `nextContext` | `any` |

###### Returns

`void`

###### Deprecated

16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

###### See

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:779

***

### ErrorInfo

#### Properties

##### componentStack?

```ts
optional componentStack: null | string;
```

Captures which component contained the exception, and its ancestors.

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:3212

##### digest?

```ts
optional digest: null | string;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:3213

***

### ExoticComponent()\<P\>

#### Extended by

- [`ProviderExoticComponent`](-internal-.md#providerexoticcomponentp)
- [`NamedExoticComponent`](../-internal--1.md#namedexoticcomponentp)

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `P` | `Object` |

```ts
interface ExoticComponent(props): ReactNode
```

**NOTE**: Exotic components are not callable.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | `P` |

#### Returns

[`ReactNode`](-internal-.md#reactnode)

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:395

#### Properties

##### $$typeof

```ts
readonly $$typeof: symbol;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:396

***

### Iterable\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Methods

##### `[iterator]`()

```ts
iterator: Iterator<T, any, undefined>
```

###### Returns

[`Iterator`](-internal-.md#iteratorttreturntnext)\<`T`, `any`, `undefined`\>

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:49

***

### Iterator\<T, TReturn, TNext\>

#### Extended by

- [`IterableIterator`](../-internal--1.md#iterableiteratort)

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | - |
| `TReturn` | `any` |
| `TNext` | `undefined` |

#### Methods

##### next()

```ts
next(...args): IteratorResult<T, TReturn>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [] \| [`TNext`] |

###### Returns

[`IteratorResult`](-internal-.md#iteratorresultttreturn)\<`T`, `TReturn`\>

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:43

##### return()?

```ts
optional return(value?): IteratorResult<T, TReturn>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `value`? | `TReturn` |

###### Returns

[`IteratorResult`](-internal-.md#iteratorresultttreturn)\<`T`, `TReturn`\>

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:44

##### throw()?

```ts
optional throw(e?): IteratorResult<T, TReturn>
```

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `e`? | `any` |

###### Returns

[`IteratorResult`](-internal-.md#iteratorresultttreturn)\<`T`, `TReturn`\>

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:45

***

### IteratorReturnResult\<TReturn\>

#### Type parameters

| Type parameter |
| :------ |
| `TReturn` |

#### Properties

##### done

```ts
done: true;
```

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:35

##### value

```ts
value: TReturn;
```

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:36

***

### IteratorYieldResult\<TYield\>

#### Type parameters

| Type parameter |
| :------ |
| `TYield` |

#### Properties

##### done?

```ts
optional done: false;
```

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:30

##### value

```ts
value: TYield;
```

###### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:31

***

### NewLifecycle\<P, S, SS\>

#### Extended by

- [`ComponentLifecycle`](-internal-.md#componentlifecyclepsss)

#### Type parameters

| Type parameter |
| :------ |
| `P` |
| `S` |
| `SS` |

#### Methods

##### componentDidUpdate()?

```ts
optional componentDidUpdate(
   prevProps, 
   prevState, 
   snapshot?): void
```

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `prevProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `prevState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |
| `snapshot`? | `SS` |

###### Returns

`void`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:705

##### getSnapshotBeforeUpdate()?

```ts
optional getSnapshotBeforeUpdate(prevProps, prevState): null | SS
```

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `prevProps` | [`Readonly`](-internal-.md#readonlyt)\<`P`\> |
| `prevState` | [`Readonly`](-internal-.md#readonlyt)\<`S`\> |

###### Returns

`null` \| `SS`

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:699

***

### ProviderExoticComponent()\<P\>

#### Extends

- [`ExoticComponent`](-internal-.md#exoticcomponentp)\<`P`\>

#### Type parameters

| Type parameter |
| :------ |
| `P` |

```ts
interface ProviderExoticComponent(props): ReactNode
```

**NOTE**: Exotic components are not callable.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | `P` |

#### Returns

[`ReactNode`](-internal-.md#reactnode)

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:403

#### Properties

##### $$typeof

```ts
readonly $$typeof: symbol;
```

###### Inherited from

[`ExoticComponent`](-internal-.md#exoticcomponentp).[`$$typeof`](-internal-.md#$$typeof)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:396

##### propTypes?

```ts
optional propTypes: WeakValidationMap<P>;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:404

***

### ProviderProps\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Properties

##### children?

```ts
optional children: ReactNode;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:374

##### value

```ts
value: T;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:373

***

### ReactElement\<P, T\>

#### Extended by

- [`ReactPortal`](-internal-.md#reactportal)
- [`Element`](../-internal-.md#element)

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `P` | `any` |
| `T` extends `string` \| [`JSXElementConstructor`](-internal-.md#jsxelementconstructorp)\<`any`\> | `string` \| [`JSXElementConstructor`](-internal-.md#jsxelementconstructorp)\<`any`\> |

#### Properties

##### key

```ts
key: null | string;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:136

##### props

```ts
props: P;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:135

##### type

```ts
type: T;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:134

***

### ReactPortal

#### Extends

- [`ReactElement`](-internal-.md#reactelementpt)

#### Properties

##### children

```ts
children: ReactNode;
```

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:175

##### key

```ts
key: null | string;
```

###### Inherited from

[`ReactElement`](-internal-.md#reactelementpt).[`key`](-internal-.md#key)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:136

##### props

```ts
props: any;
```

###### Inherited from

[`ReactElement`](-internal-.md#reactelementpt).[`props`](-internal-.md#props-1)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:135

##### type

```ts
type: string | JSXElementConstructor<any>;
```

###### Inherited from

[`ReactElement`](-internal-.md#reactelementpt).[`type`](-internal-.md#type)

###### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:134

***

### Validator()\<T\>

#### Type parameters

| Type parameter |
| :------ |
| `T` |

```ts
interface Validator(
   props, 
   propName, 
   componentName, 
   location, 
   propFullName): null | Error
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | `Object` |
| `propName` | `string` |
| `componentName` | `string` |
| `location` | `string` |
| `propFullName` | `string` |

#### Returns

`null` \| `Error`

#### Source

../../../../node\_modules/.pnpm/@types+prop-types@15.7.5/node\_modules/@types/prop-types/index.d.ts:40

#### Properties

##### [nominalTypeHack]?

```ts
optional [nominalTypeHack]: Object;
```

###### [nominalTypeHack].type

```ts
type: T;
```

###### Source

../../../../node\_modules/.pnpm/@types+prop-types@15.7.5/node\_modules/@types/prop-types/index.d.ts:41

## Type Aliases

### BaseTypes

```ts
type BaseTypes: string | number | boolean;
```

#### Source

[store/deepSignal.ts:10](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/store/deepSignal.ts#L10)

***

### Builtin

```ts
type Builtin: 
  | Primitive
  | Function
  | Date
  | Error
  | RegExp;
```

#### Source

[store/reactivity.ts:169](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/store/reactivity.ts#L169)

***

### CollectionTypes

```ts
type CollectionTypes: IterableCollections | WeakCollections;
```

#### Source

[store/collectionHandlers.ts:6](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/store/collectionHandlers.ts#L6)

***

### Consumer\<T\>

```ts
type Consumer<T>: ExoticComponent<ConsumerProps<T>>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:412

***

### Exclude\<T, U\>

```ts
type Exclude<T, U>: T extends U ? never : T;
```

Exclude from T those types that are assignable to U

#### Type parameters

| Type parameter |
| :------ |
| `T` |
| `U` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es5.d.ts:1612

***

### IterableCollections

```ts
type IterableCollections: Map<any, any> | Set<any>;
```

#### Source

[store/collectionHandlers.ts:8](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/store/collectionHandlers.ts#L8)

***

### IteratorResult\<T, TReturn\>

```ts
type IteratorResult<T, TReturn>: IteratorYieldResult<T> | IteratorReturnResult<TReturn>;
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | - |
| `TReturn` | `any` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:39

***

### JSXElementConstructor\<P\>

```ts
type JSXElementConstructor<P>: (props, deprecatedLegacyContext?) => ReactNode | (props, deprecatedLegacyContext?) => Component<any, any>;
```

#### Type parameters

| Type parameter |
| :------ |
| `P` |

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:47

***

### Pick\<T, K\>

```ts
type Pick<T, K>: { [P in K]: T[P] };
```

From T, pick a set of properties whose keys are in the union K

#### Type parameters

| Type parameter |
| :------ |
| `T` |
| `K` extends keyof `T` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es5.d.ts:1598

***

### Primitive

```ts
type Primitive: 
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null;
```

#### Source

[store/reactivity.ts:168](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/store/reactivity.ts#L168)

***

### Provider\<T\>

```ts
type Provider<T>: ProviderExoticComponent<ProviderProps<T>>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:411

***

### ReactInstance

```ts
type ReactInstance: Component<any> | Element;
```

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:474

***

### ReactNode

```ts
type ReactNode: 
  | ReactElement
  | string
  | number
  | Iterable<ReactNode>
  | ReactPortal
  | boolean
  | null
  | undefined
  | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES];
```

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:244

***

### Readonly\<T\>

```ts
type Readonly<T>: { readonly [P in keyof T]: T[P] };
```

Make all properties in T readonly

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/typescript@5.3.3/node\_modules/typescript/lib/lib.es5.d.ts:1591

***

### ResourceStore\<TResult, TSource\>

```ts
type ResourceStore<TResult, TSource>: Object;
```

#### Type parameters

| Type parameter |
| :------ |
| `TResult` |
| `TSource` extends [`AnyReactive`](README.md#anyreactive) |

#### Type declaration

##### callResult

```ts
readonly callResult: TResult | undefined;
```

##### error

```ts
error: unknown;
```

##### latest

```ts
latest: TResult | undefined;
```

##### source

```ts
readonly source: GetValue<TSource>;
```

##### state

```ts
state: ResourceState<TResult>["state"];
```

##### value

```ts
value: TResult | undefined | typeof NO_INIT;
```

#### Source

[resource/resource.ts:145](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/resource/resource.ts#L145)

***

### Validator\<T\>

```ts
type Validator<T>: Validator<T>;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:3127

***

### WeakCollections

```ts
type WeakCollections: WeakMap<any, any> | WeakSet<any>;
```

#### Source

[store/collectionHandlers.ts:9](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/store/collectionHandlers.ts#L9)

***

### WeakValidationMap\<T\>

```ts
type WeakValidationMap<T>: { [K in keyof T]?: null extends T[K] ? Validator<T[K] | null | undefined> : undefined extends T[K] ? Validator<T[K] | null | undefined> : Validator<T[K]> };
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

../../../../node\_modules/.pnpm/@types+react@18.2.37/node\_modules/@types/react/index.d.ts:3133

## Variables

### NO\_INIT

```ts
const NO_INIT: typeof NO_INIT;
```

#### Source

[resource/resource.ts:20](https://github.com/XantreGodlike/preact-signals/blob/4d16c2f/packages/utils/src/lib/resource/resource.ts#L20)

***

### identifier

```ts
const identifier: unique symbol;
```

#### Source

../../../../node\_modules/.pnpm/@preact+signals-core@1.5.0/node\_modules/@preact/signals-core/dist/signals-core.d.ts:1
