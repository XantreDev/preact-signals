import { For } from "@preact-signals/utils/components";
import { useInitSignal } from "@preact-signals/utils/hooks";

const createItems = () =>
  Array(10)
    .fill(undefined)
    .map(() => Math.round(10000 * Math.random()));

const shuffle = (array: number[]) =>
  Array.from(array).sort(() => Math.random() - 0.5);

export const TestFor = (): JSX.Element => {
  const signals = useInitSignal(() => createItems());
  console.log("TestFor render");

  return (
    <>
      <h1>TestFor</h1>
      <button
        onClick={() => {
          signals.value = createItems();
        }}
        className="mr-2"
      >
        Random
      </button>

      <button
        onClick={() => {
          signals.value = shuffle(signals.value);
        }}
      >
        Shuffle
      </button>
      <ul>
        <For each={signals}>
          {(data) => (
            <li>
              <span>{data}</span>
            </li>
          )}
        </For>
      </ul>
    </>
  );
};
