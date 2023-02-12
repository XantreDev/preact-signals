import { For, hookScope, Show, withOneRender } from "@one-render/way";
import { computed } from "@preact/signals-react";
import { useTodosQuery } from "../hooks/useTodoQuery";

export const ComponentsTest = withOneRender(() => {
  const data = hookScope(() => useTodosQuery().data);

  return (
    <Show when={data}>
      {(currentData) => (
        <ul>
          <For each={currentData} keyExtractor={(data) => data.id}>
            {(item) => (
              <li>
                <p>
                  <b>{computed(() => item.value.title)}</b>
                </p>
                <p>{computed(() => item.value.userId)}</p>0
              </li>
            )}
          </For>
        </ul>
      )}
    </Show>
  );
});
