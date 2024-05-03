import "@preact/signals-react";
import { notifyManager } from "@tanstack/query-core";
import * as matchers from "@testing-library/jest-dom/matchers";
import { act } from "@testing-library/react";
import { expect } from "vitest";

// @ts-ignore-next-line
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

expect.extend(matchers);

notifyManager.setNotifyFunction((batch) => {
  act(batch);
});
