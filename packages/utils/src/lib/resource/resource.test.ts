import {
  Signal,
  computed,
  effect,
  signal,
} from "@preact-signals/unified-signals";
import { ExpectStatic, afterEach, describe, expect, it, vi } from "vitest";
import {
  Resource,
  ResourceFetcher,
  ResourceOptions,
  ResourceState,
  resource,
} from "./resource";

const sleep = (ms?: number) => new Promise((r) => setTimeout(r, ms));
describe("resource", () => {
  const resourceFetcherInfo = (
    expect: ExpectStatic,
    obj: { refetching: unknown; value: unknown }
  ) => ({
    ...obj,
    signal: expect.any(AbortSignal),
  });
  const fetcherF = () => 220;
  let r = null as unknown as Resource<number, () => unknown>;
  afterEach(() => {
    r.dispose();
  });

  it("should have all methods", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });
    // internal
    expect(r).toHaveProperty("pr");
    expect(r).toHaveProperty("_state");
    expect(r).toHaveProperty("refetchData");
    expect(r).toHaveProperty("refetchDetector");
    expect(r).toHaveProperty("refetchEffect");
    expect(r).toHaveProperty("fetcher");
    expect(r).toHaveProperty("initialized");

    expect(r).toHaveProperty("_read");
    expect(r).toHaveProperty("_init");
    expect(r).toHaveProperty("_fetch");
    expect(r).toHaveProperty("_latest");
    expect(r).toHaveProperty("_refetch");
    expect(r).toHaveProperty("_mutate");

    // public
    expect(r).toHaveProperty("dispose");
    expect(r).toHaveProperty("mutate");
    expect(r).toHaveProperty("refetch");

    expect(r).toHaveProperty("latest");
    expect(r).toHaveProperty("loading");
    expect(r).toHaveProperty("state");

    expect(r).toBeTypeOf("function");
  });

  it("should work sync with sync fetcher", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });

    expect(r.latest).toBe(220);
    expect(fetcher).toHaveBeenCalled();
    expect(r.loading).toBe(false);
    expect(r.state).toBe("ready");
    expect(r()).toBe(220);
  });
  it("should work async with async fetcher", async () => {
    r = resource({
      fetcher: async () => 220,
    });

    expect(r()).toBe(undefined);
    await Promise.resolve();
    expect(r()).toBe(220);
  });
  it("should eager fetch if lazy is false or is not specified", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });

    expect(fetcher).toHaveBeenCalled();
    expect(r()).toBe(220);
  });
  it("should work lazy if lazy is true", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
      lazy: true,
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(r()).toBe(220);
    expect(fetcher).toHaveBeenCalled();
  });
  it("refetch should work", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });

    expect(fetcher).toHaveBeenCalled();
    expect(r()).toBe(220);
    void r.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(r()).toBe(220);
  });

  it("should respect initialValue", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      initialValue: 10,
      fetcher,
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(r()).toBe(10);
    expect(fetcher).not.toHaveBeenCalled();
  });

  type Key = keyof Pick<ResourceState<any>, keyof ResourceState<any>>;
  const keys: readonly Key[] = ["state", "loading", "error", "latest"] as const;

  for (const key of keys) {
    it("should work when some public prop read: " + key, () => {
      const fetcher = vi.fn(fetcherF);
      r = resource({
        fetcher,
        lazy: true,
      });

      expect(fetcher).not.toHaveBeenCalled();
      r[key];
      expect(fetcher).toHaveBeenCalled();
    });
  }

  it(`should have correct lifecycle: refetch (fetcher sync)`, () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });
    const states: ResourceState<number>[] = [];

    expect(fetcher).toHaveBeenCalled();
    expect(r.state).toBe("ready");
    const dispose = effect(() => {
      states.push({
        state: r.state,
        loading: r.loading,
        error: r.error,
        latest: r.latest,
        data: r(),
      } as any);
    });

    void r.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(r.state).toBe("ready");
    expect(states).toEqual(
      [
        {
          state: "ready",
          loading: false,
          error: undefined,
          latest: 220,
          data: 220,
        },
        {
          state: "ready",
          loading: false,
          error: undefined,
          latest: 220,
          data: 220,
        },
      ].filter(Boolean)
    );

    dispose();
  });

  it(`should have correct lifecycle: refetch (fetcher async)`, async () => {
    const fetcher = vi.fn(async () => fetcherF());
    r = resource({
      fetcher,
    });
    const states: ResourceState<number>[] = [];

    expect(fetcher).toHaveBeenCalled();
    const dispose = effect(() => {
      states.push({
        state: r.state,
        loading: r.loading,
        error: r.error,
        latest: r.latest,
        data: r(),
      } as any);
    });

    await sleep();

    await r.refetch();
    await sleep();

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(r.state).toBe("ready");
    expect(states).toEqual(
      [
        {
          state: "pending",
          loading: true,
          error: undefined,
          latest: undefined,
          data: undefined,
        },
        {
          state: "ready",
          loading: false,
          error: undefined,
          latest: 220,
          data: 220,
        },
        {
          state: "refreshing",
          loading: true,
          error: undefined,
          latest: 220,
          data: undefined,
        },
        {
          state: "ready",
          loading: false,
          error: undefined,
          latest: 220,
          data: 220,
        },
      ].filter(Boolean)
    );

    dispose();
  });

  it("can be used inside computed", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });

    const c = computed(() => {
      return r();
    });

    expect(c.value).toBe(220);
  });

  it("can be used inside computed", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
      lazy: true,
    });

    const c = computed(r);
    expect(fetcher).not.toHaveBeenCalled();

    expect(c.value).toBe(220);
  });

  it("should pass correct args to fetcher", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
      // source: (): boolean | number => 10,
    });

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(
      true,
      resourceFetcherInfo(expect, {
        refetching: false,
        value: undefined,
      })
    );

    void r.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(
      true,
      resourceFetcherInfo(expect, {
        refetching: true,
        value: 220,
      })
    );

    void r.refetch(false);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenCalledWith(
      true,
      resourceFetcherInfo(expect, {
        refetching: false,
        value: 220,
      })
    );
  });

  it("should pass correct args to fetcher", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
      source: (): unknown => 10,
    });

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(
      10,
      resourceFetcherInfo(expect, {
        refetching: false,
        value: undefined,
      })
    );
  });

  const falsy = [false, undefined, null] as const;
  it("should not be unresolved when source is falsy", () => {
    for (const v of falsy) {
      const fetcher = vi.fn(fetcherF);
      r = resource({
        fetcher,
        source: (): unknown => v,
      });

      expect(fetcher).not.toHaveBeenCalled();

      expect(r.state).toBe("unresolved");
      r.dispose();
    }
  });

  it("should reset when source becames falsy, and reactive when truthy again", () => {
    const sig = signal(true);

    r = resource({
      fetcher: vi.fn(fetcherF),
      source: (): unknown => sig.value,
    });

    expect(r.state).toBe("ready");
    expect(r()).toBe(220);

    sig.value = false;

    expect(r.state).toBe("unresolved");
    expect(r()).toBe(undefined);

    sig.value = true;

    expect(r.state).toBe("ready");
    expect(r()).toBe(220);
  });

  const falsyButOk = [0, "", NaN, 0n] as const;
  it("should not be resolved when source is not explicit falsy", () => {
    for (const v of falsyButOk) {
      const fetcher = vi.fn(fetcherF);
      r = resource({
        fetcher,
        source: (): unknown => v,
      });

      expect(fetcher).toHaveBeenCalled();
      expect(fetcher).toHaveBeenCalledWith(
        v,
        resourceFetcherInfo(expect, {
          refetching: false,
          value: undefined,
        })
      );

      expect(r.state).toBe("ready");
      r.dispose();
    }
  });

  it("should refetch when source value changes", () => {
    const s = signal(0);
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
      source: s as Signal<unknown>,
    });

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(
      0,
      resourceFetcherInfo(expect, {
        refetching: false,
        value: undefined,
      })
    );
    s.value++;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(
      1,
      resourceFetcherInfo(expect, {
        refetching: true,
        value: 220,
      })
    );
  });
  it("should handle mutate", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });
    const result: number[] = [];
    const dispose = effect(() => {
      result.push(r()!);
    });

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(
      true,
      resourceFetcherInfo(expect, { refetching: false, value: undefined })
    );

    r.mutate(10);
    expect(fetcher).toHaveBeenCalledTimes(1);
    dispose();
  });
  for (const type of ["sync", "async"] as const) {
    it(`should handle ${type} errors`, async () => {
      const error = new Error("bebe");
      const fetcher = vi.fn((): number | Promise<number> => {
        if (type === "sync") {
          throw error;
        }
        return Promise.reject(error);
      });
      r = resource({
        fetcher,
      });
      await sleep();
      expect(fetcher).toHaveBeenCalled();
      expect(r.error).toBe(error);
      expect(r.state).toBe("errored");
    });
  }

  describe("manualActivation", () => {
    it("shouldn't subscribe to source when manualActivation is true", () => {
      const fetcher = vi.fn(fetcherF);
      const sig = signal(0),
        r = resource({
          fetcher,
          manualActivation: true,
          source: () => sig.value,
        });

      expect(r.state).toBe("unresolved");
      expect(fetcher).not.toHaveBeenCalled();

      sig.value++;
      expect(fetcher).not.toHaveBeenCalled();

      r.activate();

      expect(fetcher).toHaveBeenCalled();
      expect(fetcher).toHaveBeenCalledWith(
        1,
        resourceFetcherInfo(expect, {
          refetching: false,
          value: undefined,
        })
      );
    });
    it("should't be subscribed to source after dispose", async () => {
      const fetcher = vi.fn(() => sleep(10).then(() => 220));
      const sig = signal(0);
      // @ts-expect-error
      r = resource({
        fetcher,
        manualActivation: true,
        source: () => sig.value,
      });

      expect(r.state).toBe("unresolved");
      expect(fetcher).not.toHaveBeenCalled();

      const dispose = r.activate();

      expect(r.state).toBe("pending");

      expect(fetcher).toHaveBeenCalledOnce();
      expect(fetcher).toHaveBeenCalledWith(
        0,
        resourceFetcherInfo(expect, { refetching: false, value: undefined })
      );
      // @ts-expect-error
      const abortSignal = fetcher.mock.calls[0][1]!.signal as AbortSignal;
      expect(abortSignal.aborted).toBe(false);
      dispose();
      expect(abortSignal.aborted).toBe(true);

      expect(r.state).toBe("unresolved");

      const dispose2 = r.activate();
      expect(r.state).toBe("pending");
      await sleep(15);

      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(fetcher).toHaveBeenCalledWith(
        0,
        resourceFetcherInfo(expect, { refetching: false, value: undefined })
      );

      expect(r.state).toBe("ready");
      expect(r()).toBe(220);

      dispose2();

      expect(r.state).toBe("unresolved");
      expect(fetcher).toHaveBeenCalledTimes(2);

      expect(r.latest).toBe(220);
    });
  });

  it("is not receiving old value after dispose", async () => {
    let sleepTime = 5;
    let fetcherResolvedTimes = 0;
    const fetcher = vi.fn(
      (...args: Parameters<ResourceFetcher<any, any, any>>) =>
        sleep(sleepTime).then(() => ++fetcherResolvedTimes)
    );

    const sig = signal(0);
    const r = resource({ fetcher, source: () => sig.value });

    const pr = sleep(sleepTime);
    sleepTime = 20;
    sig.value = 1;
    await pr;

    expect(fetcherResolvedTimes).toBe(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0]?.[1]).toBeTypeOf("object");
    expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(r()).toBe(undefined);
    await sleep(sleepTime);

    expect(fetcherResolvedTimes).toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(r()).toBe(2);
  });
});
