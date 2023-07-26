import { signal } from "@preact/signals-core";
import { describe, expect, it, vi } from "vitest";
import { createRenderer } from "../../__tests__/utils";
import { Match, Switch } from "../components";

describe("Switch()", () => {
  const { reactRoot, root, act } = createRenderer();

  it("should render", async () => {
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

  it("should render only first match", async () => {
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
  });

  it("should render only first match", async () => {
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
  });

  it("should pass getter if children is function", async () => {
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
  });

  it("should be reactive", async () => {
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

  it("should use fallback in case of no match", async () => {
    await reactRoot().render(
      <Switch fallback={<div>fallback</div>}>
        <Match when={() => false}>220</Match>
      </Switch>
    );

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "fallback");
  });

  it("should pass not explicit falsy values", async () => {
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
  });
});
