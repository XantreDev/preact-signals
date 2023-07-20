import { useSignal } from "@preact/signals-react";
import { Match, Switch } from "packages/components/src";
import { Counter } from "./Counter";

export const TestSwitch = () => {
  const counter = useSignal(0);

  return (
    <div>
      <h1>TestSwitch</h1>
      <Counter counter={counter} />
      <Switch>
        <Match when={() => counter.value % 3 === 0}>0</Match>
        <Match when={() => counter.value % 3 === 1}>1</Match>
        <Match when={() => counter.value % 3 === 2}>2</Match>
      </Switch>
    </div>
  );
};
