// patching Signal instance here
import "./tracking";

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
import { useSignal, useComputed, useSignalEffect } from "./hooks";

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
};

declare module "@preact/signals-core" {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Signal extends ReactElement {}
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ReadonlySignal extends ReactElement {}
}
