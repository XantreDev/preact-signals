import React from "react";

import { memo } from "radash";
import {
  eventIndex,
  hookExecutionMode,
  hookScopeLevel,
  isInsideOneRenderComponent,
  isScopeNeedsRerun,
  rendersData,
  renderUniqueObject
} from "./globals";
import { HookName } from "./hoc/types";
import { hookEqualityChecker, unwrap } from "./utils";

const hookRegExp = /^use\w/;

const getCurrentRenderData = () => {
  const identifier = unwrap(renderUniqueObject.get());

  const result = rendersData.get(identifier);

  if (!result) throw new Error("renderer data is not exist, but must");

  return result;
};

const getEventIndex = () => {
  const currentHookIndex = eventIndex.get();
  if (currentHookIndex < 0)
    throw new Error("hook index should be greater or equals zero");
  return currentHookIndex;
};

const getCurrentHookData = () => {
  const currentHookIndex = getEventIndex();

  const currentHookData = getCurrentRenderData().events[currentHookIndex];
  if (!currentHookData) throw new Error("Hook has no data");

  return currentHookData;
};

type AnyFunction = (...args: any[]) => any;

const getProxyHandler = memo(<T extends HookName>(name: T) => {
  const resultEqualityChecker = hookEqualityChecker(name);

  const executeHook = (target: AnyFunction, args: any[], thisArg: any): any => {
    const currentLevel = hookScopeLevel.get();

    if (
      isInsideOneRenderComponent.get() &&
      hookExecutionMode.get() === "first" &&
      currentLevel === 0
    ) {
      throw new Error(
        "Hooks in one render components allowed only in hookScopes"
      );
    }

    if (!isInsideOneRenderComponent.get()) {
      return target.call(thisArg, ...args);
    }

    const currentExecutionMode = hookExecutionMode.get();

    if (currentExecutionMode === "first") {
      const hookResult = target.call(thisArg, ...args);
      const renderData = getCurrentRenderData();
      renderData.events.push({
        type: "hook",
        args,
        hookName: name,
        result: hookResult,
      });

      return hookResult;
    }

    const currentHookData = getCurrentHookData();
    if (currentHookData.type !== "hook") {
      console.log({ currentExecutionMode, currentHookData });
      throw new Error("expected type of event should be a hook");
    }

    if (currentExecutionMode === "secondary") {
      const newHookResult = target.call(thisArg, ...currentHookData.args);

      if (!resultEqualityChecker(newHookResult, currentHookData.result)) {
        isScopeNeedsRerun.set(true);
      }
      currentHookData.result = newHookResult;

      return newHookResult;
    }

    const currentHookIndex = eventIndex.get();
    if (
      currentExecutionMode.notUseBeforeAndRerunAfterAndEqual <= currentHookIndex
    ) {
      const hookResult = target.call(thisArg, ...args);
      currentHookData.args = args;
      currentHookData.result = hookResult;

      return hookResult;
    }
    return currentHookData.result;
  };

  const proxyHandler: ProxyHandler<AnyFunction> = {
    apply(target, thisArg, args) {
      try {
        console.log(name, args);
        return executeHook(target, args, thisArg);
      } finally {
        eventIndex.actions.increment();
      }
    },
  };

  return proxyHandler;
});

const hookNames = Object.keys(React).filter((key) =>
  hookRegExp.test(key)
) as HookName[];
hookNames.forEach((hookName) => {
  const hook = React[hookName];
  React[hookName] = new Proxy(hook, getProxyHandler(hookName)) as any;
});
