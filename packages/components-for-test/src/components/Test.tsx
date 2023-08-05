import { TestQuery } from "./TestQuery";
import { TestResource } from "./TestResource";
import { TestShow } from "./TestShow";
import { TestSwitch } from "./TestSwitch";
import { TextUncachedJSXBindings } from "./TestUncached";

export const Test = (): JSX.Element => (
  <>
    <TestShow />
    <TestSwitch />
    <TestResource />
    <TestQuery />
    <TextUncachedJSXBindings />
  </>
);
