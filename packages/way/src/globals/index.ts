import type { HookName } from "@/monkeypatch";
import { createGlobal, createGlobalWithActions } from "@/utils";

export interface SignalLike<T = any> {
  value: T;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
}

export const initRenderData = (): RenderData => ({
  events: [],
  renderResult: null,
});

export type LazyNode = {
  update(newValue: any): void;
  result: SignalLike | Record<any, SignalLike>;
};
export type EventsQueueItem =
  | {
      type: "hook";
      result: unknown;
      args: any[];
      hookName: HookName;
    }
  | {
      type: "enter-to-scope";
      callback: () => void;
    }
  | {
      type: "leave-from-scope";
      lazyNode: LazyNode;
    };

export type Identifier = Record<never, unknown>;

export type RenderData = {
  events: EventsQueueItem[];
  renderResult: React.ReactNode;
};

export const renderUniqueObject = createGlobal<Identifier | null>(null);
export const rendersData = new WeakMap<Identifier, RenderData>();
export const beforeUnmountActions = new WeakMap<Identifier, (() => void)[]>();

const increment = (state: number) => state + 1;

/**
 * @internal
 */
export const eventIndex = createGlobalWithActions(-1, {
  increment,
});

export const isInsideOneRenderComponent = createGlobal(false);

export const hookScopeLevel = createGlobalWithActions(0, {
  increment,
  decrement: (state) => state - 1,
});

export const isScopeNeedsRerun = createGlobal(false);

export const hookExecutionMode = createGlobal<
  | "first"
  | "secondary"
  | { type: "rerun-scope"; notUseBeforeAndRerunAfterAndEqual: number }
>("first");
