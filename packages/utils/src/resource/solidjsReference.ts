// let pr: Promise<T> | null = null,
//   initP: Promise<T> | T | typeof NO_INIT = NO_INIT,
//   id: string | null = null,
//   loadedUnderTransition: boolean | null = false,
//   scheduled = false,
//   resolved = "initialValue" in options,
//   dynamic =
//     typeof source === "function" &&
//     createMemo(source as () => S | false | null | undefined);
// const contexts = new Set<SuspenseContextType>(),
//   [value, setValue] = (options.storage || createSignal)(
//     options.initialValue
//   ) as Signal<T | undefined>,
//   [error, setError] = createSignal<unknown>(undefined),
//   [track, trigger] = createSignal(undefined, { equals: false }),
//   [state, setState] = createSignal<
//     "unresolved" | "pending" | "ready" | "refreshing" | "errored"
//   >(resolved ? "ready" : "unresolved");
// if (sharedConfig.context) {
//   id = `${sharedConfig.context.id}${sharedConfig.context.count++}`;
//   let v;
//   if (options.ssrLoadFrom === "initial") initP = options.initialValue as T;
//   else if (sharedConfig.load && (v = sharedConfig.load(id))) initP = v[0];
// }
// function loadEnd(
//   p: Promise<T> | null,
//   v: T | undefined,
//   error?: any,
//   key?: S
// ) {
//   if (pr === p) {
//     pr = null;
//     key !== undefined && (resolved = true);
//     if ((p === initP || v === initP) && options.onHydrated)
//       queueMicrotask(() => options.onHydrated!(key, { value: v }));
//     initP = NO_INIT;
//     if (Transition && p && loadedUnderTransition) {
//       Transition.promises.delete(p);
//       loadedUnderTransition = false;
//       runUpdates(() => {
//         Transition!.running = true;
//         completeLoad(v, error);
//       }, false);
//     } else completeLoad(v, error);
//   }
//   return v;
// }
// function completeLoad(v: T | undefined, err: any) {
//   runUpdates(() => {
//     if (err === undefined) setValue(() => v);
//     setState(
//       err !== undefined ? "errored" : resolved ? "ready" : "unresolved"
//     );
//     setError(err);
//     for (const c of contexts.keys()) c.decrement!();
//     contexts.clear();
//   }, false);
// }
// function read() {
//   const c = SuspenseContext && lookup(Owner, SuspenseContext.id),
//     v = value(),
//     err = error();
//   if (err !== undefined && !pr) throw err;
//   if (Listener && !Listener.user && c) {
//     createComputed(() => {
//       track();
//       if (pr) {
//         if (c.resolved && Transition && loadedUnderTransition)
//           Transition.promises.add(pr);
//         else if (!contexts.has(c)) {
//           c.increment();
//           contexts.add(c);
//         }
//       }
//     });
//   }
//   return v;
// }
// function load(refetching: R | boolean = true) {
//   if (refetching !== false && scheduled) return;
//   scheduled = false;
//   const lookup = dynamic ? dynamic() : (source as S);
//   loadedUnderTransition = Transition && Transition.running;
//   if (lookup == null || lookup === false) {
//     loadEnd(pr, untrack(value));
//     return;
//   }
//   if (Transition && pr) Transition.promises.delete(pr);
//   const p =
//     initP !== NO_INIT
//       ? (initP as T | Promise<T>)
//       : untrack(() =>
//           fetcher(lookup, {
//             value: value(),
//             refetching,
//           })
//         );
//   if (typeof p !== "object" || !(p && "then" in p)) {
//     loadEnd(pr, p, undefined, lookup);
//     return p;
//   }
//   pr = p;
//   scheduled = true;
//   queueMicrotask(() => (scheduled = false));
//   runUpdates(() => {
//     setState(resolved ? "refreshing" : "pending");
//     trigger();
//   }, false);
//   return p.then(
//     (v) => loadEnd(p, v, undefined, lookup),
//     (e) => loadEnd(p, undefined, castError(e), lookup)
//   ) as Promise<T>;
// }
// Object.defineProperties(read, {
//   state: { get: () => state() },
//   error: { get: () => error() },
//   loading: {
//     get() {
//       const s = state();
//       return s === "pending" || s === "refreshing";
//     },
//   },
//   latest: {
//     get() {
//       if (!resolved) return read();
//       const err = error();
//       if (err && !pr) throw err;
//       return value();
//     },
//   },
// });
// if (dynamic) createComputed(() => load(false));
// else load(false);
// return [read as Resource<T>, { refetch: load, mutate: setValue }];
