import { signal } from "@preact/signals-core";
import { describe, expect, it, vi } from "vitest";
import { Match, Switch } from "../components";
import { createRenderer, sleep } from "./utils";

describe("Switch()", () => {
  const { reactRoot, root } = createRenderer();

  it("should render", async () => {
    reactRoot().render(
      <Switch>
        <Match when={() => 1}>
          <div>1</div>
        </Match>
      </Switch>
    );
    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  it("should render only first match", async () => {
    reactRoot().render(
      <Switch>
        <Match when={() => 1}>
          <div>1</div>
        </Match>
        <Match when={() => 2}>
          <div>2</div>
        </Match>
      </Switch>
    );

    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  it("should render only first match", async () => {
    reactRoot().render(
      <Switch>
        <Match when={() => true}>
          <div>1</div>
        </Match>
        <Match when={() => 2}>
          <div>2</div>
        </Match>
      </Switch>
    );

    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  it("should pass getter if children is function", async () => {
    const ref = {};

    const children = vi.fn((value) => <div>{ref === value() ? 1 : 0}</div>);
    reactRoot().render(
      <Switch>
        <Match when={() => ref}>{children}</Match>
      </Switch>
    );

    await sleep(0);

    expect(children).toHaveBeenCalledOnce();

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  it("should be reactive", async () => {
    const sig = signal(0);

    reactRoot().render(
      <Switch>
        <Match when={() => sig.value % 3 === 0}>220</Match>
        <Match when={() => sig.value % 3 === 1}>221</Match>
        <Match when={() => sig.value % 3 === 2}>222</Match>
      </Switch>
    );

    await sleep(0);
    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "220");

    sig.value = 1;

    await sleep(0);
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "221");
  });

  it("should use fallback in case of no match", async () => {
    reactRoot().render(
      <Switch fallback={<div>fallback</div>}>
        <Match when={() => false}>220</Match>
      </Switch>
    );

    await sleep(0);
    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "fallback");
  });

  it("should pass not explicit falsy values", async () => {
    const sig = signal<unknown>(0);

    const expectResult = async () => {
      await sleep(0);
      const content = root.firstChild;
      expect(content).is.instanceOf(Text);
      expect(content).has.property("data", "220");
    };

    const expectFallback = async () => {
      await sleep(0);
      const content = root.firstChild;
      expect(content).is.instanceOf(Text);
      expect(content).has.property("data", "fallback");
    };

    reactRoot().render(
      <Switch fallback={"fallback"}>
        <Match when={() => sig.value}>220</Match>
      </Switch>
    );
    try {
      await expectResult();

      sig.value = false;

      await expectFallback();

      sig.value = 1;

      await expectResult();

      sig.value = null;

      await expectFallback();

      sig.value = undefined;
      await expectFallback();

      sig.value = [];
      await expectResult();
    } catch (e) {
      console.log("failed with: ", sig.peek());
      throw e;
    }
  });
});
