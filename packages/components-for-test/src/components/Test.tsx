import { TestQuery } from "./TestQuery";
import { TestResource } from "./TestResource";
import { TestShow } from "./TestShow";
import { TestSwitch } from "./TestSwitch";

export const Test = () => (
  <>
    <TestShow />
    <TestSwitch />
    <TestResource />
    <TestQuery />
  </>
);
