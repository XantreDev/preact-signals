import { For, withOneRender } from "@one-render/way";
import { signal } from "@preact/signals-react";

const createArray = (length = 100) =>
  Array.from({ length }).map(() => signal(Math.random()));

const items = createArray();

setInterval(() => items[50].value++, 100);

const Button = withOneRender<{ digit: number }>((props) => (
  <button onClick={() => props.digit.value++}>{props.digit}</button>
));

export const RenderUI = withOneRender(() => (
  <>
    {items.map((number) => (
      <Button key={number.peek()} digit={number} />
    ))}
  </>
));

export const RenderUIFor = withOneRender(() => {
  const arr = signal(createArray(100));
  setInterval(() => {
    arr.value = [...arr.peek().slice(10), ...arr.peek().slice(0, 10)];
  }, 1_000);

  console.log(arr);
  return (
    <For keyExtractor={(item) => item} each={arr}>
      {(item) => (console.log(item.peek()), (<Button digit={item} />))}
    </For>
  );
});

RenderUIFor.displayName = "RenderUIFor";
