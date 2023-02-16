import { hookScope, withOneRender } from "@one-render/way";
import { zip } from "radash";
import { memo, useEffect, useRef, useState } from "react";

const increment = (value: number) => value + 1;

const timeouts = [2, 5, 3];

const items = Array.from({ length: 100 }).map((__, index) => index + 1);

const withItems = true;

const renderItems = () => items.map((item) => <li key={item}>{item}</li>);

type RerenderProps = {
  onRerender: () => void;
};

const BenchRerenderOneRender = withOneRender<RerenderProps>(
  ({ onRerender }) => {
    const createHookScope = (delay: number) => {
      hookScope(() =>
        useEffect(() => {
          onRerender.peek()();
        })
      );
      hookScope(() => {
        const [state, setState] = useState(0);

        useEffect(() => {
          const interval = setInterval(() => setState(increment), delay);

          return () => clearInterval(interval);
        }, []);
      });
    };

    timeouts.forEach(createHookScope);

    return withItems ? <ul>{renderItems()}</ul> : null;
  }
);

const BenchRerenderSimple = ({ onRerender }: RerenderProps) => {
  const [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0);
  const [state3, setState3] = useState(0);
  onRerender();
  useEffect(() => {
    const sets = [setState1, setState2, setState3];
    const intervalsData = zip(timeouts, sets);
    const intervals = intervalsData.map(([delay, setter]) =>
      setInterval(() => setter(increment), delay)
    );

    return () => intervals.forEach(clearInterval);
  }, []);

  return withItems ? <ul>{renderItems()}</ul> : null;
};

const BENCH_RERENDER_COUNT = 1_000;
const ComponentToTest = BenchRerenderSimple;

export const Bench = memo(() => {
  const [isStopped, setIsStopped] = useState(true);
  const countOfRerendersRef = useRef(0);

  const onRerender = () => {
    if (countOfRerendersRef.current > BENCH_RERENDER_COUNT) {
      return setIsStopped(true);
    }
    countOfRerendersRef.current += 1;
  };

  const start = () => {
    countOfRerendersRef.current = 0;
    setIsStopped(false);
  };

  return isStopped ? (
    <button onClick={start}>Start bench</button>
  ) : (
    <>
      <ComponentToTest onRerender={onRerender} />
    </>
  );
});
