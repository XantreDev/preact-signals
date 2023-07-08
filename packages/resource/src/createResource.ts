import { Accessor, AnyAccessorOrSignal } from "@preact-signals/utils";
import { ResourceOptions, ResourceReturn, resource } from "./resource";

/**
 * Creates a resource that wraps a repeated promise in a reactive pattern:
 * ```typescript
 * // Without source
 * const [resource, { mutate, refetch }] = createResource(fetcher, options);
 * // With source
 * const [resource, { mutate, refetch }] = createResource(source, fetcher, options);
 * ```
 * @param source - reactive data function which has its non-nullish and non-false values passed to the fetcher, optional
 * @param fetcher - function that receives the source (true if source not provided), the last or initial value, and whether the resource is being refetched, and returns a value or a Promise:
 * ```typescript
 * const fetcher: ResourceFetcher<S, T, R> = (
 *   sourceOutput: S,
 *   info: { value: T | undefined, refetching: R | boolean }
 * ) => T | Promise<T>;
 * ```
 * @param options - an optional object with the initialValue and the name (for debugging purposes); see {@link ResourceOptions}
 *
 * @returns ```typescript
 * [Resource<T>, { mutate: Setter<T>, refetch: () => void }]
 * ```
 *
 * * Setting an `initialValue` in the options will mean that both the prev() accessor and the resource should never return undefined (if that is wanted, you need to extend the type with undefined)
 * * `mutate` allows to manually overwrite the resource without calling the fetcher
 * * `refetch` will re-run the fetcher without changing the source, and if called with a value, that value will be passed to the fetcher via the `refetching` property on the fetcher's second parameter
 *
 * @description https://www.solidjs.com/docs/latest/api#createresource
 */
export function createResource<
  TResult,
  TSource extends AnyAccessorOrSignal = Accessor<true>,
  TRefreshing = boolean
>(
  options: ResourceOptions<TResult, TSource, TRefreshing>
): ResourceReturn<TResult, TRefreshing> {
  const result = resource(options);
  return [
    result,
    {
      mutate: result.mutate,
      refetch: result.refetch,
    },
  ];
}
