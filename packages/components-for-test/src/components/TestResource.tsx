import { useResource } from "@preact-signals/resource";
import { Match, Switch } from "packages/components/src";
import { fetchTodos } from "../utils";

export const TestResource = () => {
  const [resource, { refetch }] = useResource({
    fetcher: fetchTodos,
  });

  return (
    <>
      <h1>TestResource</h1>
      <button onClick={() => refetch()}>Refresh</button>
      <Switch>
        <Match when={() => resource.loading}>Loading...</Match>
        <Match when={() => resource.error}>Error</Match>
        <Match when={() => resource()}>
          {(todos) => (
            <ul>
              {todos().map((todo) => (
                <li key={todo.id}>
                  {todo.title}, {todo.completed ? "Completed" : "Not completed"}
                </li>
              ))}
            </ul>
          )}
        </Match>
      </Switch>
    </>
  );
};
