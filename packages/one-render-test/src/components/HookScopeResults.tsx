import { hookScope, withOneRender } from "one-render";
import { useTodoQuery } from "../hooks/useTodoQuery";

export const HookScopeResults = withOneRender(() => {
  const results = hookScope(() => {
    console.log(useTodoQuery().isLoading);
  });

  console.log(results);

  return null;
});
