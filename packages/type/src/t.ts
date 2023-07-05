import { ReactDOM } from "react";
import "./initial";
type C = ReactDOM["div"];
type D = Parameters<C>[0];
type E = NonNullable<D>["onDoubleClick"];
//   ^?
type C2 = JSX.IntrinsicElements["div"];
