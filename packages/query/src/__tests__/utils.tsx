import { ReadonlySignal, effect, signal } from "@preact/signals-react";
import * as utils from "@tanstack/query-core";
import { act, render } from "@testing-library/react";
import { randomUUID } from "node:crypto";
import * as React from "react";
import { createElement, useEffect, useState } from "react";
import { vi } from "vitest";
import type {
  ContextOptions,
  MutationOptions,
  QueryClientConfig,
} from "../react-query";
import { QueryClient, QueryClientProvider } from "../react-query";

export const queueSignal = <T,>() => {
  const noValue = Symbol("no-value");
  const $signal = signal<T | typeof noValue>(noValue);
  const queue = [] as T[];

  const dispose = effect(() => {
    if ($signal.value === noValue) return;
    queue.push($signal.value);
  });

  return {
    queue,
    emit: (value: T) => {
      $signal.value = value;
    },
    dispose,
  };
};

// for some reason signals runtime is not working with tests
export const useSignalState = <T,>(signal: ReadonlySignal<T>): T => {
  const [state, setState] = useState(signal.value);

  useEffect(() => effect(() => setState(signal.value)), [signal]);

  return state;
};
export const fetchTime = (ms: number) => async () => {
  await sleep(ms);

  return "data";
};

export const createHooksComponentElement = (hooks: () => unknown) => {
  const Component = () => {
    hooks();

    return null;
  };

  return createElement(Component);
};

export function renderWithClient(
  client: QueryClient,
  ui: React.ReactElement,
  options: ContextOptions = {}
): ReturnType<typeof render> {
  const { rerender, ...result } = render(
    <QueryClientProvider client={client} context={options.context}>
      {ui}
    </QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={client} context={options.context}>
          {rerenderUi}
        </QueryClientProvider>
      ),
  } as any;
}

export const Blink = ({
  duration,
  children,
}: {
  duration: number;
  children: React.ReactNode;
}) => {
  const [shouldShow, setShouldShow] = React.useState<boolean>(true);

  React.useEffect(() => {
    setShouldShow(true);
    const timeout = setActTimeout(() => setShouldShow(false), duration);
    return () => {
      clearTimeout(timeout);
    };
  }, [duration, children]);

  return shouldShow ? <>{children}</> : <>off</>;
};

export function createQueryClient(config?: QueryClientConfig): QueryClient {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  return new QueryClient({ logger: mockLogger, ...config });
}

export function mockVisibilityState(value: DocumentVisibilityState) {
  return vi.spyOn(document, "visibilityState", "get").mockReturnValue(value);
}

export function mockNavigatorOnLine(value: boolean) {
  return vi.spyOn(navigator, "onLine", "get").mockReturnValue(value);
}

export const mockLogger = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

export function queryKey(): Array<string> {
  return [`query_${randomUUID()}`];
}

export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, timeout);
  });
}

export function setActTimeout(fn: () => void, ms?: number) {
  return setTimeout(() => {
    act(() => {
      fn();
    });
  }, ms);
}

/**
 * Assert the parameter is of a specific type.
 */
export function expectType<T>(_: T): void {
  return undefined;
}

/**
 * Assert the parameter is not typed as `any`
 */
export function expectTypeNotAny<T>(_: 0 extends 1 & T ? never : T): void {
  return undefined;
}

export function executeMutation(
  queryClient: QueryClient,
  options: MutationOptions<any, any, any, any>
): Promise<unknown> {
  return queryClient.getMutationCache().build(queryClient, options).execute();
}

// This monkey-patches the isServer-value from utils,
// so that we can pretend to be in a server environment
export function setIsServer(isServer: boolean) {
  const original = utils.isServer;
  Object.defineProperty(utils, "isServer", {
    get: () => isServer,
  });

  return () => {
    Object.defineProperty(utils, "isServer", {
      get: () => original,
    });
  };
}
