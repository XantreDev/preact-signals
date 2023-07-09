import { QueryClient } from "@tanstack/query-core";
import React from "react";
import { ContextOptions } from "../../tmp/types";

export const defaultContext = React.createContext<QueryClient | undefined>(
  undefined
);

function getQueryClientContext(
  context: React.Context<QueryClient | undefined> | undefined
) {
  return context ? context : defaultContext;
}

export const useQueryClient = ({ context }: ContextOptions = {}) => {
  const queryClient = React.useContext(getQueryClientContext(context));

  if (!queryClient) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }

  return queryClient;
};

type QueryClientProviderPropsBase = {
  client: QueryClient;
  children?: React.ReactNode;
};
type QueryClientProviderPropsWithContext = ContextOptions & {
  contextSharing?: never;
} & QueryClientProviderPropsBase;

export type QueryClientProviderProps = QueryClientProviderPropsWithContext;

export const QueryClientProvider = ({
  client,
  children,
  context,
}: QueryClientProviderProps): JSX.Element => {
  React.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);

  const Context = getQueryClientContext(context);

  return <Context.Provider value={client}>{children}</Context.Provider>;
};

const IsRestoringContext = React.createContext(false);
export const useIsRestoring = () => React.useContext(IsRestoringContext);
export const IsRestoringProvider = IsRestoringContext.Provider;
