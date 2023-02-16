export * from "@one-render/monkeypatch";

// import type { HookName } from "@/monkeypatch";
// import { createGlobal, createGlobalWithActions } from "@/utils";

// export interface SignalLike<T = any> {
//   value: T;
//   peek(): T;
//   subscribe(fn: (value: T) => void): () => void;
// }

// export const initRenderData = (): RenderData => ({
//   events: [],
//   renderResult: null,
// });

// export type LazyNode = {
//   update(newValue: any): void;
//   result: SignalLike | Record<any, SignalLike>;
// };
// export type EventsQueueItem =
//   | {
//       type: "hook";
//       result: unknown;
//       args: any[];
//       hookName: HookName;
//     }
//   | {
//       type: "enter-to-scope";
//       callback: () => void;
//     }
//   | {
//       type: "leave-from-scope";
//       lazyNode: LazyNode;
//     };

// export type Identifier = Record<never, unknown>;

// export type RenderData = {
//   events: EventsQueueItem[];
//   renderResult: React.ReactNode;
// };

// const renderUniqueObject = createGlobal<Identifier | null>(null);
// const rendersData = new WeakMap<Identifier, RenderData>();
// const beforeUnmountActions = new WeakMap<Identifier, (() => void)[]>();

// const increment = (state: number) => state + 1;

// /**
//  * @internal
//  */
// const eventIndex = createGlobalWithActions(-1, {
//   increment,
// });

// const isInsideOneRenderComponent = createGlobal(false);

// const hookScopeLevel = createGlobalWithActions(0, {
//   increment,
//   decrement: (state) => state - 1,
// });

// const isScopeNeedsRerun = createGlobal(false);

// const hookExecutionMode = createGlobal<
//   | "first"
//   | "secondary"
//   | { type: "rerun-scope"; notUseBeforeAndRerunAfterAndEqual: number }
// >("first");
// export const {
//   beforeUnmountActions,
//   eventIndex,
//   hookExecutionMode,
//   hookScopeLevel,
//   isInsideOneRenderComponent,
//   isScopeNeedsRerun,
//   renderUniqueObject,
//   rendersData,
// } = (() => {
//   const increment = (state: number) => state + 1;

//   const globals = [
//     ["renderUniqueObject", () => createGlobal<Identifier | null>(null)],
//     ["rendersData", () => new WeakMap<Identifier, RenderData>()],
//     ["beforeUnmountActions", () => new WeakMap<Identifier, (() => void)[]>()],
//     [
//       "eventIndex",
//       () =>
//         createGlobalWithActions(-1, {
//           increment,
//         }),
//     ],
//     ["isInsideOneRenderComponent", () => createGlobal(false)],
//     [
//       "hookScopeLevel",
//       () =>
//         createGlobalWithActions(0, {
//           increment,
//           decrement: (state) => state - 1,
//         }),
//     ],
//     ["isScopeNeedsRerun", () => createGlobal(false)],
//     [
//       "hookExecutionMode",
//       () =>
//         createGlobal<
//           | "first"
//           | "secondary"
//           | { type: "rerun-scope"; notUseBeforeAndRerunAfterAndEqual: number }
//         >("first"),
//     ],
//   ] as const;

//   return Object.fromEntries(
//     globals.map(([key, value]) => [
//       key,
//       // @ts-ignore
//       key in window ? window[key] : ((window[key] = value()), window[key]),
//     ])
//   ) as {
//     [Values in typeof globals[number] as Values["0"]]: ReturnType<Values["1"]>;
//   };
// })();
