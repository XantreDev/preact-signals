import { useSWR } from "./useSWR";

export const useTodoQuery = () =>
  useSWR("https://jsonplaceholder.typicode.com/todos/1", (url) =>
    fetch(url).then((r) => r.json())
  );
