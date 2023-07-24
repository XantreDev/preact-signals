import {
  Accessor,
  AnyReactive,
  GetTruthyValue,
  GetValue,
  Setter,
  isExplicitFalsy,
  setterOfSignal,
} from "@preact-signals/internal-utils";
import {
  ReadonlySignal,
  Signal,
  batch,
  computed,
  effect,
  signal,
} from "@preact/signals-core";
import { NO_INIT } from "./constants";
import { isPromise, removeNoInit } from "./utils";

/**
 * A resource that waits for a source to be truthy before fetching.
 */
export interface Unresolved {
  state: "unresolved";
  loading: false;
  error: undefined;
  latest: undefined;
  (): undefined;
}

export interface Pending {
  state: "pending";
  loading: true;
  error: undefined;
  latest: undefined;
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
  | Unresolved
  | Pending
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
};

export type ResourceOptions<
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
  TSourceData extends GetTruthyValue<TSource> = GetTruthyValue<TSource>
> = {
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
   * lazy: Optional. If true, the resource will not be fetched until access of ResourceState properties.
   */
  lazy?: boolean;
  /**
   * A function that is used to fetch or refresh the resource.
   */
  fetcher: ResourceFetcher<TSourceData, TResult, TRefreshing>;
};

// export type InitializedResourceOptions<T, S = unknown> = ResourceOptions<T> & {
//   initialValue: T;
// };
// export type InitializedResourceReturn<T, R = unknown> = [
//   InitializedResource<T>,
//   ResourceActions<T, R>
// ];

export type Resource<
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
  TSourceData extends GetTruthyValue<TSource> = GetTruthyValue<TSource>
> = ResourceState<TResult> & {
  /** @internal */
  pr: Promise<TResult> | null;
  /** @internal */
  error$: Signal<unknown>;
  /** @internal */
  state$: Signal<ResourceState<TResult>["state"]>;
  /** @internal */
  refreshDummy$: Signal<boolean>;
  /** @internal */
  value$: Signal<TResult | undefined | typeof NO_INIT>;
  /** @internal */
  source$: Signal<GetValue<TSource>>;
  /** @internal */
  callResult$: ReadonlySignal<TResult | undefined>;
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

  disposed: boolean;
  dispose(): void;
  mutate: ResourceActions<TResult | undefined, TRefreshing>["mutate"];
  refetch: ResourceActions<TResult, TRefreshing>["refetch"];
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

  self.source$ = computed(() => {
    const source = options.source;
    if (!source) {
      return true;
    }
    if (typeof source === "function") {
      return source();
    }

    return source.value;
  });

  self.value$ = signal(options.initialValue ?? NO_INIT);

  const initialValueProvided = self.value$.peek() !== NO_INIT;
  self.pr = null;
  self.error$ = signal<unknown>(undefined);
  self.state$ = signal<ResourceState<TResult>["state"]>(
    initialValueProvided ? "ready" : "unresolved"
  );
  self.refetchData = initialValueProvided;
  self.callResult$ = computed(() => {
    if (self.state$.value !== "ready") {
      return undefined;
    }
    return removeNoInit(self.value$.value);
  });
  self.fetcher = options.fetcher;
  self.refreshDummy$ = signal(false);
  self.refetchEffect = null;
  self.disposed = false;
  self.isInitialValueProvided = initialValueProvided;

  if (!options.lazy) {
    self._init();
  }

  return self;
}

Resource.prototype = Object.create(Function.prototype);

const refetchDetector: Resource<any, any, any, any>["refetchDetector"] =
  function (this: Resource<any, any, any, any>) {
    this.refreshDummy$.value;
    return {
      source: this.source$.value,
      refetching: this.refetchData,
    };
  };

const _init: Resource<any, any, any, any>["_init"] = function (
  this: Resource<any, any, any, any>
) {
  let skipFetch = this.isInitialValueProvided;
  this.refetchEffect = effect(() => {
    const { source, refetching } = this.refetchDetector();
    if (
      this.state$.peek() === "refreshing" ||
      this.state$.peek() === "pending" ||
      isExplicitFalsy(source)
    ) {
      return;
    }
    if (skipFetch) {
      skipFetch = false;
      return;
    }
    this._fetch({ source, refetching });
  });
};

const _fetch: Resource<any, any, any, any>["_fetch"] = function (
  this: Resource<any, any, any, any>,
  data
) {
  const currentState = this.state$.peek();
  const fetcher = this.fetcher;
  const result = batch(() => {
    if (currentState === "errored" || currentState === "ready") {
      this.state$.value = "refreshing";
    }
    if (currentState === "unresolved") {
      this.state$.value = "pending";
    }
    this.error$.value = undefined;
    let result: unknown | Promise<unknown>;
    try {
      result = fetcher(data.source, {
        value: removeNoInit(this.value$.peek()),
        refetching: data.refetching,
      });
    } catch (e) {
      this.state$.value = "errored";
      this.error$.value = e;
      return;
    }
    if (!isPromise(result)) {
      this.value$.value = result;
      this.state$.value = "ready";
      return;
    }
    return result;
  });
  this.refetchData = true;
  if (!result) {
    return;
  }
  this.pr = result.then(
    (value) => {
      batch(() => {
        this.pr = null;
        this.value$.value = value;
        this.state$.value = "ready";
      });
    },
    (error) => {
      batch(() => {
        this.pr = null;
        this.error$.value = error;
        this.state$.value = "errored";
      });
    }
  );
};

const _read: Resource<any, any, any, any>["_read"] = function (
  this: Resource<any, any, any, any>
) {
  if (!this.initialized) {
    this._init();
  }

  return this.callResult$.value;
};

const _latest: Resource<any, any, any, any>["_latest"] = function (
  this: Resource<any, any, any, any>
) {
  if (!this.initialized) {
    this._init();
  }

  return this.value$.value === NO_INIT ? undefined : this.value$.value;
};

const _refetch: Resource<any, any, any, any>["_refetch"] = function (
  this: Resource<any, any, any, any>,
  customRefetching: unknown
) {
  batch(() => {
    this.refreshDummy$.value = !this.refreshDummy$.peek();
    if (customRefetching === undefined) {
      return;
    }
    this.refetchData = customRefetching;
  });
};

const _mutate: Resource<any, any, any, any>["_mutate"] = function <T>(
  this: Resource<any, any, any, any>,
  updater: Setter<T>
) {
  const currentState = this.state$.peek();
  if (currentState === "refreshing" || currentState === "pending") {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Mutating resource while it is refreshing or pending is not allowed."
      );
    }
    return;
  }

  return setterOfSignal(this.value$)(updater);
};
const dispose: Resource<any, any, any, any>["dispose"] = function (
  this: Resource<any, any, any, any>
) {
  if (this.disposed) {
    return;
  }
  this.refetchEffect?.();
  this.disposed = true;
};

Resource.prototype.refetchDetector = refetchDetector;
Resource.prototype._refetch = _refetch;
Resource.prototype._read = _read;
Resource.prototype._fetch = _fetch;
Resource.prototype._init = _init;
Resource.prototype._latest = _latest;
Resource.prototype._mutate = _mutate;

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
      if (!this.initialized) {
        this._init();
      }
      return this.state$.value;
    },
  },
  error: {
    get(this: Resource<any, any, any, any>) {
      if (!this.initialized) {
        this._init();
      }
      return this.error$.value;
    },
  },
  loading: {
    get(this: Resource<any, any, any, any>) {
      if (!this.initialized) {
        this._init();
      }
      return (
        this.state$.value === "pending" || this.state$.value === "refreshing"
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
