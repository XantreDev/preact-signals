import {
  Signal,
  batch,
  effect,
  signal,
  untracked,
} from "@preact-signals/unified-signals";
import { FlatStore, createFlatStore } from "../flat-store";
import { FlatStoreSetter } from "../flat-store/setter";
import { Dispose } from "../hooks/utility";
import {
  Accessor,
  AnyReactive,
  GetTruthyValue,
  GetValue,
  Setter,
  isExplicitFalsy,
} from "../utils";

const NO_INIT = Symbol("NO_INIT");

/*@__NO_SIDE_EFFECTS__*/
const isPromise = <T>(value: unknown): value is Promise<T> =>
  !!value && typeof value === "object" && value instanceof Promise;

/*@__NO_SIDE_EFFECTS__*/
const removeNoInit = <T>(value: T | typeof NO_INIT) =>
  value !== NO_INIT ? value : undefined;

/**
 * A resource that waits for a source to be truthy before fetching.
 */
export interface Unresolved<T> {
  state: "unresolved";
  loading: false;
  error: undefined;
  latest: T | undefined;
  (): undefined;
}

export interface Pending<T> {
  state: "pending";
  loading: true;
  error: undefined;
  latest: T | undefined;
  (): undefined;
}

export interface Ready<T> {
  state: "ready";
  loading: false;
  error: undefined;
  latest: T;
  (): T;
}

export interface Refreshing<T> {
  state: "refreshing";
  loading: true;
  error: undefined;
  latest: T | undefined;
  (): undefined;
}

export interface Errored<T> {
  state: "errored";
  loading: false;
  error: unknown;
  latest: T | undefined;
  (): undefined;
}

/* 
  Unresolved --> Pending : fetch
  Pending --> Ready : resolve
  Pending --> Errored : reject
  Ready --> Refreshing : refresh
  Refreshing --> Ready : resolve
  Refreshing --> Errored : reject
  Errored --> Refreshing : refresh
*/

export type ResourceState<T> =
  | Unresolved<T>
  | Pending<T>
  | Ready<T>
  | Refreshing<T>
  | Errored<T>;

export type InitializedResource<T> = Ready<T> | Refreshing<T> | Errored<T>;

export type ResourceActions<TResult, TRefetch = unknown> = {
  mutate: Setter<TResult>;
  refetch: (info?: TRefetch) => TResult | Promise<TResult> | undefined | null;
};

export type ResourceSource<S> = () => S | false | null | undefined;

export type ResourceFetcher<TSourceData, TResult, TRefreshing> = (
  k: TSourceData,
  info: ResourceFetcherInfo<TResult, TRefreshing>
) => TResult | Promise<TResult>;

export type ResourceFetcherInfo<TSourceData, TRefreshing = unknown> = {
  value: TSourceData | undefined;
  refetching: TRefreshing | boolean;
  /** will be aborted if source is updated or resource disposed */
  signal: AbortSignal;
};
export type ResourceOptions<
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
  TSourceData extends GetTruthyValue<TSource> = GetTruthyValue<TSource>
> =
  | {
      /**
       * Optional. An initial value for the resource. If is provided resource will be in ready state.
       */
      initialValue?: TResult;
      /**
       * Optional. A function or signal that can be used as a source for fetching the resource.
       * This can be useful if you need to base your fetch operation on the value of another signal or even resource
       */
      source?: TSource;
      /**
       * A function that is used to fetch or refresh the resource.
       */
      fetcher: ResourceFetcher<TSourceData, TResult, TRefreshing>;
    } & (
      | {
          /**
           * lazy: Optional. If true, the resource will not be fetched until access of ResourceState properties.
           */
          lazy?: boolean;
        }
      | {
          /**
           * Optional. If true, the resource will not subscribe to the source signal, before be activated.
           */
          manualActivation?: boolean;
        }
    );

type ResourceStore<TResult, TSource extends AnyReactive> = {
  state: ResourceState<TResult>["state"];
  value: TResult | undefined | typeof NO_INIT;
  error: unknown;
  latest: TResult | undefined;
  readonly source: GetValue<TSource>;

  readonly callResult: TResult | undefined;
};

export type Resource<
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
  TSourceData extends GetTruthyValue<TSource> = GetTruthyValue<TSource>
> = ResourceState<TResult> & {
  /**
   * A function that should be used to activate the resource with manualActivation option enabled.
   */
  activate(): Dispose;
  dispose(): void;
  mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
  refetch: ResourceActions<TResult, TRefreshing>["refetch"];

  /** @internal */
  pr: Promise<TResult> | null;
  /** @internal */
  _state: FlatStore<ResourceStore<TResult, TSource>>;
  /** @internal */
  setter: FlatStoreSetter<ResourceStore<TResult, TSource>>;
  /** @internal */
  abortController: AbortController | null;

  /** @internal */
  _onRead(): void;
  /** @internal */
  manualActivation: boolean;
  /** @internal */
  refreshDummy$: Signal<boolean>;
  /** @internal */
  refetchData: boolean | TRefreshing;
  /** @internal */
  refetchDetector(): {
    source: GetValue<TSource>;
    refetching: TRefreshing | boolean;
  };
  /** @internal */
  refetchEffect: null | (() => void);
  /** @internal */
  fetcher: ResourceFetcher<TSourceData, TResult, TRefreshing>;
  /** @internal */
  get initialized(): boolean;
  /** @internal */
  isInitialValueProvided: boolean;

  /** @internal */
  _read(): ReturnType<ResourceState<TResult>>;
  /** @internal */
  _init(): void;
  /** @internal */
  _fetch(data: {
    source: GetTruthyValue<TSource>;
    refetching: TRefreshing | boolean;
  }): void;
  /** @internal */
  _latest(): TResult | undefined;
  /** @internal */
  _refetch: ResourceActions<TResult, TRefreshing>["refetch"];
  /** @internal */
  _mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
};

function Resource<
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
  TSourceData extends GetTruthyValue<TSource> = GetTruthyValue<TSource>
>(options: ResourceOptions<TResult, TSource, TRefreshing, TSourceData>) {
  const self = (() => {
    return self._read();
  }) as Resource<TResult, TSource, TRefreshing, TSourceData>;

  Object.setPrototypeOf(self, Resource.prototype);

  const initialValueProvided = (options.initialValue ?? NO_INIT) !== NO_INIT;
  const [store, setter] = createFlatStore<ResourceStore<TResult, TSource>>({
    get source() {
      const source = options.source;
      if (!source) {
        return true;
      }
      if (typeof source === "function") {
        return source();
      }

      return source.value;
    },
    latest: options.initialValue ?? undefined,
    value: options.initialValue ?? NO_INIT,
    error: undefined,
    state: initialValueProvided ? "ready" : "unresolved",
    get callResult() {
      if (this.state !== "ready") {
        return undefined;
      }
      return removeNoInit(this.value);
    },
  });

  self._state = store;
  self.setter = setter;

  self.pr = null;
  self.refetchData = initialValueProvided;
  self.fetcher = options.fetcher;
  self.refreshDummy$ = signal(false);
  self.refetchEffect = null;
  self.isInitialValueProvided = initialValueProvided;
  self.manualActivation =
    "manualActivation" in options ? !!options.manualActivation : false;

  // @ts-expect-error union stuff
  if (!options?.lazy && !self.manualActivation) {
    self._init();
  }

  return self;
}

Resource.prototype = Object.create(Function.prototype);

const refetchDetector: Resource<any, any, any, any>["refetchDetector"] =
  function (this: Resource<any, any, any, any>) {
    this.refreshDummy$.value;
    return {
      source: this._state.source,
      refetching: this.refetchData,
    };
  };

const _init: Resource<any, any, any, any>["_init"] = function (
  this: Resource<any, any, any, any>
) {
  let skipFetch = this.isInitialValueProvided;
  this.refetchEffect = effect(() => {
    const { source, refetching } = this.refetchDetector();
    if (isExplicitFalsy(source)) {
      this.setter({
        state: "unresolved",
        error: undefined,
        value: NO_INIT,
      });
      return;
    }
    if (skipFetch) {
      skipFetch = false;
      return;
    }

    this.abortController?.abort();
    this.abortController = null;

    untracked(() => this._fetch({ source, refetching }));
  });
};

const _fetch: Resource<any, any, any, any>["_fetch"] = function (
  this: Resource<any, any, any, any>,
  data
) {
  const currentState = this._state.state;
  const fetcher = this.fetcher;
  batch(() => {
    if (currentState === "errored" || currentState === "ready") {
      this._state.state = "refreshing";
    }
    if (currentState === "unresolved") {
      this._state.state = "pending";
    }
    const value = removeNoInit(this._state.value);
    this._state.latest = value;
    this._state.value = undefined;
    let result: unknown | Promise<unknown>;
    const abortController = new AbortController();
    this.abortController = abortController;
    try {
      result = fetcher(data.source, {
        value: value,
        refetching: data.refetching,
        signal: this.abortController.signal,
      });
    } catch (e) {
      this.setter({
        state: "errored",
        error: e,
      });
      this.abortController = null;
      return;
    }
    if (!isPromise(result)) {
      this.abortController = null;
      this.setter({
        value: result,
        latest: result,
        state: "ready",
      });
      this.refetchData = true;
      return;
    }

    this.refetchData = true;
    if (!result) {
      return;
    }
    // TODO: fix - here can be previous data
    this.pr = result.then(
      (value) => {
        if (abortController.signal.aborted) {
          return;
        }
        this.pr = null;
        this.setter({
          value,
          latest: value,
          state: "ready",
        });
      },
      (error) => {
        if (abortController.signal.aborted) {
          return;
        }
        this.pr = null;

        this.setter({
          error,
          state: "errored",
        });
      }
    );
  });
};

const _read: Resource<any, any, any, any>["_read"] = function (
  this: Resource<any, any, any, any>
) {
  this._onRead();

  return this._state.callResult;
};

const _latest: Resource<any, any, any, any>["_latest"] = function (
  this: Resource<any, any, any, any>
) {
  this._onRead();

  return removeNoInit(this._state.latest);
};

const _refetch: Resource<any, any, any, any>["_refetch"] = function (
  this: Resource<any, any, any, any>,
  customRefetching: unknown
) {
  if (customRefetching !== undefined) {
    this.refetchData = customRefetching;
  }
  this.refreshDummy$.value = !this.refreshDummy$.peek();
};

const _mutate: Resource<any, any, any, any>["_mutate"] = function <T>(
  this: Resource<any, any, any, any>,
  updater: Setter<T>
) {
  const updaterFn = typeof updater === "function" ? updater : () => updater;
  return untracked(() => {
    this.setter({
      state: "ready",
      error: undefined,
      value: updaterFn(this._state.value),
    });
  });
};
const dispose: Resource<any, any, any, any>["dispose"] = function (
  this: Resource<any, any, any, any>
) {
  this.refetchEffect?.();
  this.abortController?.abort();
  this.setter({
    state: "unresolved",
    error: undefined,
    value: NO_INIT,
  });
  this.refetchEffect = null;
};

const _onRead: Resource<any, any, any, any>["_onRead"] = function (
  this: Resource<any, any, any, any>
) {
  if (!this.initialized && !this.manualActivation) {
    this._init();
  }
};

const activate: Resource<any, any, any, any>["activate"] = function (
  this: Resource<any, any, any, any>
) {
  if (!this.initialized) {
    this._init();
  }

  return this.dispose.bind(this);
};

Resource.prototype.refetchDetector = refetchDetector;
Resource.prototype._refetch = _refetch;
Resource.prototype._read = _read;
Resource.prototype._fetch = _fetch;
Resource.prototype._init = _init;
Resource.prototype._latest = _latest;
Resource.prototype._mutate = _mutate;
Resource.prototype._onRead = _onRead;
Resource.prototype.activate = activate;

Object.defineProperty(Resource.prototype, "initialized", {
  get(this: Resource<any, any, any, any>) {
    return this.refetchEffect !== null;
  },
});

// public api
Object.defineProperties(Resource.prototype, {
  latest: {
    get(this: Resource<any, any, any, any>) {
      return this._latest();
    },
  },
  state: {
    get(this: Resource<any, any, any, any>) {
      this._onRead();
      return this._state.state;
    },
  },
  error: {
    get(this: Resource<any, any, any, any>) {
      this._onRead();
      return this._state.error;
    },
  },
  loading: {
    get(this: Resource<any, any, any, any>) {
      this._onRead();
      return (
        this._state.state === "pending" || this._state.state === "refreshing"
      );
    },
  },

  // binding to not miss this
  dispose: {
    get(this: Resource<any, any, any, any>) {
      return dispose.bind(this);
    },
  },
  refetch: {
    get(this: Resource<any, any, any, any>) {
      return this._refetch.bind(this);
    },
  },
  mutate: {
    get(this: Resource<any, any, any, any>) {
      return this._mutate.bind(this);
    },
  },
});

/**
 * More preact signals like resource api
 */
export const resource = <
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
  TSourceData extends GetTruthyValue<TSource> = GetTruthyValue<TSource>
>(
  options: ResourceOptions<TResult, TSource, TRefreshing, TSourceData>
) => Resource(options);
