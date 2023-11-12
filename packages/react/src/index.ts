import {
  signal,
  computed,
  batch,
  effect,
  Signal,
  type ReadonlySignal,
  untracked,
} from "@preact/signals-core";
import type { ReactElement } from "react";
import { useSignal, useComputed, useSignalEffect, useSignals } from "./hooks";

export {
  signal,
  computed,
  batch,
  effect,
  Signal,
  type ReadonlySignal,
  useSignal,
  useComputed,
  useSignalEffect,
  untracked,
  useSignals,
};

declare module "@preact/signals-core" {
  // @ts-ignore internal Signal is viewed as function
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Signal extends ReactElement {}
}
