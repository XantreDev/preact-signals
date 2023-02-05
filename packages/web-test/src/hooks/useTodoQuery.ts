import { useSWR } from "./useSWR";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const jsonFetch = <T>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json());

export const useTodoQuery = () =>
  useSWR("https://jsonplaceholder.typicode.com/todos/1", jsonFetch<Todo>);

export const useTodosQuery = () =>
  useSWR("https://jsonplaceholder.typicode.com/todos/", jsonFetch<Todo[]>);
