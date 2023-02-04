import { computed } from "@preact/signals-react";
import { hookScope, withOneRender } from "one-render";
import { useTodoQuery } from "../hooks/useTodoQuery";

export const HookScopeResults = withOneRender(() => {
  const results = hookScope(() => {
    return useTodoQuery().data;
  });

  console.log(results);

  const stringified = computed(() => JSON.stringify(results.value));

  return <div>{stringified}</div>;
});
