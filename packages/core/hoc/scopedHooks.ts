import {
  eventIndex,
  EventsQueueItem,
  hookExecutionMode,
  hookScopeLevel,
  initRenderData,
  isInsideOneRenderComponent,
  isScopeNeedsRerun,
  RenderData,
  rendersData,
  renderUniqueObject
} from "@one-render/globals";
import { createGlobal, unwrap } from "@one-render/utils";
import React from "react";
import { Simplify } from "type-fest";
import { Brand, BrandString, lazyNode } from "./lazyResults";
import { HookExecutorProps, Signalify, SignalifyObject } from "./types";

const hookScopeRunMode = createGlobal<"first" | "rerun">("first");

type HookScopeResult<T> = T extends Brand
  ? SignalifyObject<Omit<T, BrandString>>
  : Signalify<T>;

const getRenderDataFromHookScope = () =>
  unwrap(
    rendersData.get(
      unwrap(
        renderUniqueObject.get(),
        "renderUniqueObject should exist inside one render component"
      )
    ),
    "renderData should exist in hookScope"
  );

export const hookScope = <T>(
  callback: () => T
): Simplify<HookScopeResult<T>> => {
  if (!isInsideOneRenderComponent.get()) {
    throw new Error("hookScopes allowed only in one render components");
  }

  const currentEventIndex = eventIndex.get();
  if (currentEventIndex < 0) {
    throw new Error("hook index is negative");
  }

  const isFirstRender = hookScopeRunMode.get() === "first";

  if (!isFirstRender) {
    const result = callback();

    const currentEvent = getRenderDataFromHookScope().events[eventIndex.get()];
    if (currentEvent?.type !== "leave-from-scope") {
      throw new Error("expected leave from hook scope");
    }
    currentEvent.lazyNode.update(result);

    // eventIndex.actions.increment();
    return currentEvent.lazyNode.result as any;
  }

  const currentRenderData = getRenderDataFromHookScope();

  currentRenderData.events.push({
    type: "enter-to-scope",
    callback,
  });
  eventIndex.actions.increment();
  hookScopeLevel.actions.increment();

  try {
    const result = callback();
    const event: EventsQueueItem = {
      type: "leave-from-scope",
      lazyNode: lazyNode(result),
    };
    currentRenderData.events.push(event);
    return event.lazyNode.result as any;
  } finally {
    hookScopeLevel.actions.decrement();
    eventIndex.actions.increment();
  }
};

const handler: ProxyHandler<React.FC<HookExecutorProps["props"]>> = {
  apply(target, thisArg, args) {
    const [{ uniqueRenderObject, props }, ...otherProps] = args as [
      HookExecutorProps
    ];

    renderUniqueObject.set(uniqueRenderObject);
    isInsideOneRenderComponent.set(true);
    eventIndex.set(0);
    hookScopeLevel.set(0);

    try {
      const currentRenderData = rendersData.get(uniqueRenderObject);
      const isFirstRender = !currentRenderData;
      if (isFirstRender) {
        return executeFirstRun(
          uniqueRenderObject,
          target,
          thisArg,
          props,
          otherProps
        );
      }
      // console.log(currentRenderData);
      // return;

      return executeSecondRender(currentRenderData);
    } finally {
      isInsideOneRenderComponent.set(false);
    }
  },
};
export const scopedHooksChild = <T = unknown>(renderFunction: React.FC<T>) => {
  return new Proxy(renderFunction, handler) as React.FC<HookExecutorProps<T>>;
};

function executeSecondRender(currentRenderData: RenderData) {
  hookExecutionMode.set("secondary");
  let prevScopeIndex = 0;
  // it can be only rerender
  for (let i = 0; i < currentRenderData.events.length; ++i) {
    eventIndex.set(i);

    const eventData = unwrap(currentRenderData.events[i]);
    if (eventData.type === "enter-to-scope") {
      prevScopeIndex = i;
      continue;
    }
    if (eventData.type === "leave-from-scope") {
      continue;
    }

    isScopeNeedsRerun.set(false);
    (React[eventData.hookName] as any)(...eventData.args);
    if (!isScopeNeedsRerun.get()) {
      continue;
    }
    console.log(eventData);
    const currentHookIndex = eventIndex.get();
    hookExecutionMode.set({
      notUseBeforeAndRerunAfterAndEqual: currentHookIndex,
      type: "rerun-scope",
    });

    const scopeData = unwrap(currentRenderData.events[prevScopeIndex]);
    if (scopeData.type !== "enter-to-scope") {
      throw new Error("Enter to scope is expected but have: " + scopeData.type);
    }
    const prevScopeCallback = scopeData.callback;
    eventIndex.set(prevScopeIndex + 1);

    hookScopeRunMode.set("rerun");
    try {
      hookScope(prevScopeCallback);
    } finally {
      hookScopeRunMode.set("first");
      hookExecutionMode.set("secondary");
      i = eventIndex.get() - 1;
    }
  }

  return currentRenderData.renderResult;
}

function executeFirstRun(
  uniqueRenderObject: object,
  target: React.FC<unknown>,
  thisArg: any,
  props: unknown,
  otherProps: unknown[]
) {
  rendersData.set(uniqueRenderObject, initRenderData());
  hookExecutionMode.set("first");
  const renderResult = target.call(thisArg, props, ...otherProps);

  const renderData = unwrap(
    rendersData.get(uniqueRenderObject),
    "Render data should exist"
  );
  renderData.renderResult = renderResult;

  return renderResult;
}
