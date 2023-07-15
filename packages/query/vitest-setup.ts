// import "@preact/signals-react";
import { notifyManager } from "@tanstack/query-core";
import matchers from "@testing-library/jest-dom/matchers";
import { act } from "@testing-library/react";
import { expect } from "vitest";

expect.extend(matchers);

notifyManager.setNotifyFunction((batch) => {
  act(batch);
});
