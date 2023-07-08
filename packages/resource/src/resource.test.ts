import { Signal, computed, effect, signal } from "@preact/signals-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Resource, ResourceState, resource } from "./resource";

const sleep = (ms?: number) => new Promise((r) => setTimeout(r, ms));
describe("resource", () => {
  const fetcherF = vi.fn(() => 220);
  let r = null as unknown as Resource<number, () => unknown>;
  afterEach(() => {
    r.dispose();
  });

  it("should have all methods", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
    });
    expect(r).toHaveProperty("pr");
    expect(r).toHaveProperty("error$");
    expect(r).toHaveProperty("state$");
    expect(r).toHaveProperty("value$");
    expect(r).toHaveProperty("source$");
    expect(r).toHaveProperty("callResult$");
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

    expect(r).toHaveProperty("disposed");
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
    r.refetch();
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

    r.refetch();
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

    r.refetch();
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
    expect(fetcher).toHaveBeenCalledWith(true, {
      refetching: false,
      value: undefined,
    });

    r.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(true, {
      refetching: true,
      value: 220,
    });

    r.refetch(false);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenCalledWith(true, {
      refetching: false,
      value: 220,
    });
  });

  it("should pass correct args to fetcher", () => {
    const fetcher = vi.fn(fetcherF);
    r = resource({
      fetcher,
      source: (): unknown => 10,
    });

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(10, {
      refetching: false,
      value: undefined,
    });
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

  const falsyButOk = [0, "", NaN, 0n] as const;
  it("should not be resolved when source is not explicit falsy", () => {
    for (const v of falsyButOk) {
      const fetcher = vi.fn(fetcherF);
      r = resource({
        fetcher,
        source: (): unknown => v,
      });

      expect(fetcher).toHaveBeenCalled();
      expect(fetcher).toHaveBeenCalledWith(v, {
        refetching: false,
        value: undefined,
      });

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
    expect(fetcher).toHaveBeenCalledWith(0, {
      refetching: false,
      value: undefined,
    });
    s.value++;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(1, {
      refetching: true,
      value: 220,
    });
  });
});
