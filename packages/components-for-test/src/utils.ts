export type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export const fetchTodos = () =>
  fetch("https://jsonplaceholder.typicode.com/todos").then<Todo[]>((response) =>
    response.json()
  );
