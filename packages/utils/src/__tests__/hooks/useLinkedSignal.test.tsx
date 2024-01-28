import { signal } from "@preact-signals/unified-signals";
import React from "react";
import { describe } from "vitest";
import { useLinkedSignal } from "../../lib/hooks";
import { itRenderer } from "../utils";

describe.concurrent("useLinkedSignal()", () => {
  itRenderer(
    "should be linked to state",
    async ({ reactRoot, expect, act }) => {
      let rerender: null | (() => void) = null;
      const Cmp = () => {
        const [state, setState] = React.useState({});
        rerender = () => setState({});
        const sig = useLinkedSignal(state);
        expect(sig.peek()).toBe(state);
        return null;
      };
      await reactRoot().render(<Cmp />);

      expect(rerender).toBeTypeOf("function");

      await act(() => {
        rerender!();
      });

      await act(() => {
        rerender!();
      });
    }
  );

  itRenderer("should unwrap signals", async ({ reactRoot, act, expect }) => {
    const chooseSignal = signal(false);
    const sig1 = signal(0);
    const sig2 = signal(-10);
    await reactRoot().render(
      React.createElement(() => {
        const linked = useLinkedSignal(chooseSignal.value ? sig1 : sig2);

        expect(linked.peek()).toBe(chooseSignal.peek() ? 0 : -10);

        return null;
      })
    );

    await act(() => {
      chooseSignal.value = true;
    });
  });

  itRenderer("should unwrap deeply", async ({ reactRoot, act, expect }) => {
    const sig1 = signal(signal(signal(0)));
    await reactRoot().render(
      React.createElement(() => {
        expect(useLinkedSignal(sig1).peek()).toBe(0);

        return null;
      })
    );
  });
});
