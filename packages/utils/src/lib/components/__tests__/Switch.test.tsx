import { signal } from "@preact-signals/unified-signals";
import React, { useMemo } from "react";
import { describe, Mock, vi } from "vitest";
import { itRenderer } from "../../../__tests__/utils";
import { Match, Switch } from "../components";

describe.concurrent("Switch()", () => {
  itRenderer("should render", async ({ reactRoot, root, expect }) => {
    await reactRoot().render(
      <Switch>
        <Match when={() => 1}>
          <div>1</div>
        </Match>
      </Switch>
    );

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  itRenderer(
    "should render only first match",
    async ({ reactRoot, root, expect }) => {
      await reactRoot().render(
        <Switch>
          <Match when={() => 1}>
            <div>1</div>
          </Match>
          <Match when={() => 2}>
            <div>2</div>
          </Match>
        </Switch>
      );

      const content = root.firstChild;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content).has.property("textContent", "1");
    }
  );

  itRenderer(
    "should render only first match",
    async ({ reactRoot, root, expect }) => {
      await reactRoot().render(
        <Switch>
          <Match when={() => true}>
            <div>1</div>
          </Match>
          <Match when={() => 2}>
            <div>2</div>
          </Match>
        </Switch>
      );

      const content = root.firstChild;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content).has.property("textContent", "1");
    }
  );

  itRenderer(
    "should pass getter if children is function",
    async ({ expect, reactRoot, root }) => {
      const ref = {};

      const children = vi.fn((value) => <div>{ref === value() ? 1 : 0}</div>);
      await reactRoot().render(
        <Switch>
          <Match when={() => ref}>{children}</Match>
        </Switch>
      );

      expect(children).toHaveBeenCalledOnce();

      const content = root.firstChild;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content).has.property("textContent", "1");
    }
  );

  itRenderer("should be reactive", async ({ reactRoot, act, expect, root }) => {
    const sig = signal(0);

    await reactRoot().render(
      <Switch>
        <Match when={() => sig.value % 3 === 0}>220</Match>
        <Match when={() => sig.value % 3 === 1}>221</Match>
        <Match when={() => sig.value % 3 === 2}>222</Match>
      </Switch>
    );

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "220");
    await act(() => {
      sig.value = 1;
    });

    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "221");
  });

  itRenderer(
    "should use fallback in case of no match",
    async ({ reactRoot, expect, root }) => {
      await reactRoot().render(
        <Switch fallback={<div>fallback</div>}>
          <Match when={() => false}>220</Match>
        </Switch>
      );

      const content = root.firstChild;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content).has.property("textContent", "fallback");
    }
  );

  itRenderer(
    "should pass not explicit falsy values",
    async ({ reactRoot, act, root, expect }) => {
      const sig = signal<unknown>(0);

      const expectResult = () => {
        const content = root.firstChild;
        expect(content).is.instanceOf(Text);
        expect(content).has.property("data", "220");
      };

      const expectFallback = () => {
        const content = root.firstChild;
        expect(content).is.instanceOf(Text);
        expect(content).has.property("data", "fallback");
      };

      await reactRoot().render(
        <Switch fallback={"fallback"}>
          <Match when={() => sig.value}>220</Match>
        </Switch>
      );
      try {
        expectResult();

        await act(() => {
          sig.value = false;
        });
        expectFallback();

        await act(() => {
          sig.value = 1;
        });
        expectResult();

        await act(() => {
          sig.value = null;
        });
        expectFallback();

        await act(() => {
          sig.value = undefined;
        });
        expectFallback();

        await act(() => {
          sig.value = [];
        });
        expectResult();
      } catch (e) {
        console.log("failed with: ", sig.peek());
        throw e;
      }
    }
  );
  itRenderer(
    "must reexecute child even if nothing changed",
    async ({ act, expect, reactRoot, root }) => {
      const sig = signal(0);
      const matchWhen = vi.fn(() => 10);
      const renderWhen = vi.fn(() => 220);

      const Component = vi.fn(() => {
        sig.value;

        return (
          <Switch fallback={"fallback"}>
            <Switch.Match when={matchWhen}>{renderWhen}</Switch.Match>
          </Switch>
        );
      });

      await reactRoot().render(<Component />);

      const firstChild = root.firstChild;
      expect(firstChild).is.instanceOf(Text);
      expect(firstChild).has.property("data", "220");

      expect(Component).toHaveBeenCalledTimes(1);
      expect(matchWhen).toHaveBeenCalledTimes(1);
      expect(renderWhen).toHaveBeenCalledTimes(1);

      await act(() => {
        sig.value++;
      });

      expect(Component).toHaveBeenCalledTimes(2);
      expect(matchWhen).toHaveBeenCalledTimes(2);
      expect(renderWhen).toHaveBeenCalledTimes(2);
    }
  );
});
