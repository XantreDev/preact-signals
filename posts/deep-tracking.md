### Proud to announce deep reacivity tracking for preact-signals

I've adopted Vue deep tracking with preact/signals to create a new
primitive: `deepSignal`. `deepSignal` supports tracking of primitives, objects, arrays, Sets, Maps, WeakMaps, WeakSets,
and your own custom classes.

```tsx
import { deepSignal } from "@preact-signals/utils/store";

const primitiveOrObject = deepSignal<
  | number
  | {
      count: number;
      counts: number[];
    }
>(0);

effect(() => {
  // logs 0 on the first launch
  console.log(primitiveOrObject.value);
});

primitiveOrObject.value++;
// logs 1

primitiveOrObject.value = {
  count: 0,
  counts: [],
};
// logs { count: 0, counts: [] }
primitiveOrObject.value.count++;
// logs { count: 1, counts: [] }
primitiveOrObject.value.counts.push(1);
// logs { count: 1, counts: [1] }
```

This kind of tracking passes all `@vue/reactivity` tests which is compatible with preact/signals. It relies on
the JS `Proxy` to achieve this. We have the same low-level API that Vue reactivity offers, with some renaming. This functionality
is not fully treeshackable, so I've aliased it as `Store` in `@preact-signals/utils/store`. After stabilizing the API, `store` entry
exports will be moved into the root.

| Vue               | `@preact-signals/utils/store` |
| ----------------- | ----------------------------- |
| `reactive`        | `Store.deepReactive`          |
| `readonly`        | `Store.deepReadonly`          |
| `shallowReadonly` | `Store.shallowReadonly`       |
| `shallowReactive` | `Store.shallowReactive`       |
| `isReactive`      | `Store.isReactive`            |
| `isReadonly`      | `Store.isReadonly`            |
| `isProxy`         | `Store.isProxy`               |
| `toRaw`           | `Store.toRaw`                 |
| `markRaw`         | `Store.markRaw`               |

```tsx
import { Store } from "@preact-signals/utils/store";

const state = Store.deepReactive({
  a: 0,
  b: 0,
});

effect(() => {
  // logs 0
  console.log(state.a + state.b);
});

state.a++;
// logs 1
state.b++;
// logs 2
```

## Signals unwrapping

When using deep tracking any signals that are inside of the object will be unwrapped. You also can reassing other signal to
the property of deep signal

```tsx
import { Store } from "@preact-signals/utils/store";

const state: {
  a: number;
  b: number;
} = Store.deepReactive({
  a: signal(10),
  b: 0,
});

// logs 10
console.log(state.a);

state.a++;

// logs 11
console.log(state.a);

// @ts-expect-error this will cause error in typescript because until latest version of typescript (5.1+) we can't type getters with other values
state.a = signal(20);

// logs 20
console.log(state.a);
```

So for typing deep signals better to use `DeepSignal` then generic `deepSignal`

```tsx
import { deepSignal } from "@preact-signals/utils/store";
// type error
deepSignal<
    a: number;
    b: number;
>({
  a: signal(10),
  b: 0,
});

// ok
const state: DeepSignal<{
  a: number;
  b: number;
}> = deepSignal({
  a: signal(10),
  b: 0,
});
```

## Naturally, all preact signal utils work with deep tracking

```tsx
const state = Store.deepReactive({
  a: 0,
  b: 0,
});

const doubleA = computed(() => state.a + state.b);

effect(() => {
  // logs 0
  console.log(doubleA.value);
});

batch(() => {
  state.a++;
  state.b++;
});
// logs 2
```

## React/Preact integration:

```tsx
import { useDeepReactive } from "@preact-signals/utils/store/hooks";

const Component = () => {
  const state = useDeepReactive({
    a: 0,
    b: 0,
  });

  return (
    <div>
      <button onClick={() => state.a++}>Increment A</button>
      <button onClick={() => state.b++}>Increment B</button>
      <div>
        {state.a} + {state.b} = {state.a + state.b}
      </div>
    </div>
  );
};
```

### All functionalities will be available with the next release of the `@preact-signals/utils` package on 17 September 2023.
