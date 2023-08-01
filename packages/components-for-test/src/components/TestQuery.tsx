import {
  QueryClient,
  QueryClientProvider,
  useQuery$,
} from "@preact-signals/query";
import { Match, Switch } from "@preact-signals/utils/components";
import { useSignalEffect } from "@preact/signals-react";
import { PropsWithChildren } from "react";
import { fetchTodos } from "../utils";

const client = new QueryClient();

const Provider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
const Test = () => {
  const query$ = useQuery$(() => ({
    queryFn: fetchTodos,
    queryKey: ["todos"],
  }));
  useSignalEffect(() => {
    console.log(query$.isLoading, query$.data);
  });

  return (
    <>
      <h1>QueryTest</h1>
      <div>
        <button onClick={() => query$.refetch()}>Refetch</button>
      </div>
      <Switch>
        <Match when={() => query$.isFetching}>Loading...</Match>
        <Match when={() => query$.isError}>Error</Match>
        <Match when={() => query$.data}>
          {(data) =>
            data()
              .map((item) => item.title)
              .join("\n")
          }
        </Match>
      </Switch>
    </>
  );
};

export const TestQuery = (): JSX.Element => (
  <Provider>
    <Test />
  </Provider>
);
