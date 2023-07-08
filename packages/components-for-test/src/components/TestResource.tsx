import { Match, Switch } from "@preact-signals/components";
import { useResource } from "@preact-signals/resource";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export const TestResource = () => {
  const [resource, { refetch }] = useResource({
    fetcher: () =>
      fetch("https://jsonplaceholder.typicode.com/todos").then<Todo[]>(
        (response) => response.json()
      ),
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
