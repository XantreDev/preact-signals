import {
  signal,
  computed,
  useComputed,
  useSignalEffect,
  useSignal,
} from "../../src";
import type { Signal, ReadonlySignal } from "../../src";
import React, {
  Fragment,
  forwardRef,
  useMemo,
  useReducer,
  memo,
  StrictMode,
  createRef,
  useState,
  useContext,
  createContext,
  useRef,
} from "react";
import type { FunctionComponent } from "react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { renderToStaticMarkup } from "react-dom/server";
import {
  createRoot,
  Root,
  act,
  checkHangingAct,
  isReact16,
  isProd,
  getConsoleErrorSpy,
  checkConsoleErrorLogs,
} from "../shared/utils";

describe("@preact/signals-react updating", () => {
  let scratch: HTMLDivElement;
  let root: Root;

  async function render(element: Parameters<Root["render"]>[0]) {
    await act(() => root.render(element));
  }

  beforeEach(async () => {
    scratch = document.createElement("div");
    document.body.appendChild(scratch);
    root = await createRoot(scratch);
    getConsoleErrorSpy().mockReset();
  });

  afterEach(async () => {
    await act(() => root.unmount());
    scratch.remove();

    checkConsoleErrorLogs();
    checkHangingAct();
  });

  describe("SignalValue bindings", () => {
    it("should render text without signals", async () => {
      await render(<span>test</span>);
      const span = scratch.firstChild;
      const text = span?.firstChild;
      expect(text).to.have.property("data", "test");
    });

    it("should render Signals as SignalValue", async () => {
      const sig = signal("test");
      await render(<span>{sig}</span>);
      const span = scratch.firstChild;
      expect(span).to.have.property("firstChild").that.is.an.instanceOf(Text);
      const text = span?.firstChild;
      expect(text).to.have.property("data", "test");
    });

    it("should render computed as SignalValue", async () => {
      const sig = signal("test");
      const comp = computed(() => `${sig} ${sig}`);
      await render(<span>{comp}</span>);
      const span = scratch.firstChild;
      expect(span).to.have.property("firstChild").that.is.an.instanceOf(Text);
      const text = span?.firstChild;
      expect(text).to.have.property("data", "test test");
    });

    it("should update Signal-based SignalValue (no parent component)", async () => {
      const sig = signal("test");
      await render(<span>{sig}</span>);

      const text = scratch.firstChild!.firstChild!;
      expect(text).to.have.property("data", "test");

      await act(() => {
        sig.value = "changed";
      });

      // should not remount/replace SignalValue
      expect(scratch.firstChild!.firstChild!).to.equal(text);
      // should update the text in-place
      expect(text).to.have.property("data", "changed");
    });

    it("should update Signal-based SignalValue (in a parent component)", async () => {
      const sig = signal("test");
      function App({ x }: { x: typeof sig }) {
        return <span>{x}</span>;
      }
      await render(<App x={sig} />);

      const text = scratch.firstChild!.firstChild!;
      expect(text).to.have.property("data", "test");

      await act(() => {
        sig.value = "changed";
      });

      // should not remount/replace SignalValue
      expect(scratch.firstChild!.firstChild!).to.equal(text);
      // should update the text in-place
      expect(text).to.have.property("data", "changed");
    });

    it("should work with JSX inside signal", async () => {
      const sig = signal(<b>test</b>);
      function App({ x }: { x: typeof sig }) {
        return <span>{x}</span>;
      }
      await render(<App x={sig} />);

      let text = scratch.firstChild!.firstChild!;
      expect(text).to.be.instanceOf(HTMLElement);
      expect(text.firstChild).to.have.property("data", "test");

      await act(() => {
        sig.value = <div>changed</div>;
      });

      text = scratch.firstChild!.firstChild!;
      expect(text).to.be.instanceOf(HTMLDivElement);
      expect(text.firstChild).to.have.property("data", "changed");
    });
  });

  describe("Component bindings", () => {
    it("should subscribe to signals", async () => {
      const sig = signal("foo");

      function App() {
        const value = sig.value;
        return <p>{value}</p>;
      }

      await render(<App />);
      expect(scratch.textContent).to.equal("foo");

      await act(() => {
        sig.value = "bar";
      });
      expect(scratch.textContent).to.equal("bar");
    });

    it("should rerender components when signals they use change", async () => {
      const signal1 = signal(0);
      function Child1() {
        return <div>{signal1}</div>;
      }

      const signal2 = signal(0);
      function Child2() {
        return <div>{signal2}</div>;
      }

      function Parent() {
        return (
          <Fragment>
            <Child1 />
            <Child2 />
          </Fragment>
        );
      }

      await render(<Parent />);
      expect(scratch.innerHTML).to.equal("<div>0</div><div>0</div>");

      await act(() => {
        signal1.value += 1;
      });
      expect(scratch.innerHTML).to.equal("<div>1</div><div>0</div>");

      await act(() => {
        signal2.value += 1;
      });
      expect(scratch.innerHTML).to.equal("<div>1</div><div>1</div>");
    });

    it("should subscribe to signals passed as props to DOM elements", async () => {
      const className = signal("foo");
      function App() {
        // @ts-expect-error React types don't allow signals on DOM elements :/
        return <div className={className} />;
      }

      await render(<App />);

      expect(scratch.innerHTML).to.equal('<div class="foo"></div>');

      await act(() => {
        className.value = "bar";
      });

      expect(scratch.innerHTML).to.equal('<div class="bar"></div>');
    });

    it("should activate signal accessed in render", async () => {
      const sig = signal(null);

      function App() {
        const arr = useComputed(() => {
          // trigger read
          sig.value;

          return [];
        });

        const str = arr.value.join(", ");
        return <p>{str}</p>;
      }

      try {
        await render(<App />);
      } catch (e: any) {
        expect.fail(e.stack);
      }
    });

    it("should not subscribe to child signals", async () => {
      const sig = signal("foo");

      function Child() {
        const value = sig.value;
        return <p>{value}</p>;
      }

      const spy = vi.fn();
      function App() {
        spy();
        return <Child />;
      }

      await render(<App />);
      expect(scratch.textContent).toBe("foo");

      await act(() => {
        sig.value = "bar";
      });
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it("should update memo'ed component via signals", async () => {
      const sig = signal("foo");

      function Inner() {
        const value = sig.value;
        return <p>{value}</p>;
      }

      function App() {
        sig.value;
        return useMemo(() => <Inner />, []);
      }

      await render(<App />);
      expect(scratch.textContent).to.equal("foo");

      await act(() => {
        sig.value = "bar";
      });
      expect(scratch.textContent).to.equal("bar");
    });

    it("should update forwardRef'ed component via signals", async () => {
      const sig = signal("foo");

      const Inner = forwardRef(() => {
        return <p>{sig.value}</p>;
      });

      function App() {
        return <Inner />;
      }

      await render(<App />);
      expect(scratch.textContent).to.equal("foo");

      await act(() => {
        sig.value = "bar";
      });
      expect(scratch.textContent).to.equal("bar");
    });

    it("should consistently rerender in strict mode", async () => {
      const sig = signal(-1);

      const Test = () => <p>{sig.value}</p>;
      const App = () => (
        <StrictMode>
          <Test />
        </StrictMode>
      );

      await render(<App />);
      expect(scratch.textContent).to.equal("-1");

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          sig.value = i;
        });
        expect(scratch.textContent).to.equal("" + i);
      }
    });

    it("should consistently rerender in strict mode (with memo)", async () => {
      const sig = signal(-1);

      const Test = memo(() => <p>{sig.value}</p>);
      const App = () => (
        <StrictMode>
          <Test />
        </StrictMode>
      );

      await render(<App />);
      expect(scratch.textContent).to.equal("-1");

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          sig.value = i;
        });
        expect(scratch.textContent).to.equal("" + i);
      }
    });

    it.fails("should render static markup of a component", async () => {
      const count = signal(0);

      const Test = () => {
        return (
          <pre>
            {renderToStaticMarkup(<code>{count}</code>)}
            {renderToStaticMarkup(<code>{count.value}</code>)}
          </pre>
        );
      };

      await render(<Test />);
      expect(scratch.textContent).to.equal("<code>0</code><code>0</code>");

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          count.value += 1;
        });
        expect(scratch.textContent).to.equal(
          `<code>${count.value}</code><code>${count.value}</code>`
        );
      }
    });

    it("should correctly render components that have useReducer()", async () => {
      const count = signal(0);

      let increment: () => void;
      const Test = () => {
        const [state, dispatch] = useReducer(
          (state: number, action: number) => {
            return state + action;
          },
          -2
        );

        increment = () => dispatch(1);

        const doubled = count.value * 2;

        return (
          <pre>
            <code>{state}</code>
            <code>{doubled}</code>
          </pre>
        );
      };

      await render(<Test />);
      expect(scratch.innerHTML).to.equal(
        "<pre><code>-2</code><code>0</code></pre>"
      );

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          count.value += 1;
        });
        expect(scratch.innerHTML).to.equal(
          `<pre><code>-2</code><code>${count.value * 2}</code></pre>`
        );
      }

      await act(() => {
        increment();
      });
      expect(scratch.innerHTML).to.equal(
        `<pre><code>-1</code><code>${count.value * 2}</code></pre>`
      );
    });

    it("should not fail when a component calls setState while rendering", async () => {
      let increment: () => void;
      function App() {
        const [state, setState] = useState(0);
        increment = () => setState(state + 1);

        if (state > 0 && state < 2) {
          setState(state + 1);
        }

        return <div>{state}</div>;
      }

      await render(<App />);
      expect(scratch.innerHTML).to.equal("<div>0</div>");

      await act(() => {
        increment();
      });
      expect(scratch.innerHTML).to.equal("<div>2</div>");
    });

    it("should not fail when a component calls setState multiple times while rendering", async () => {
      let increment: () => void;
      function App() {
        const [state, setState] = useState(0);
        increment = () => setState(state + 1);

        if (state > 0 && state < 5) {
          setState(state + 1);
        }

        return <div>{state}</div>;
      }

      await render(<App />);
      expect(scratch.innerHTML).to.equal("<div>0</div>");

      await act(() => {
        increment();
      });
      expect(scratch.innerHTML).to.equal("<div>5</div>");
    });

    it("should not fail when a component only uses state-less hooks", async () => {
      // This test is suppose to trigger a condition in React where the
      // HooksDispatcherOnMountWithHookTypesInDEV is used. This dispatcher is
      // used in the development build of React if a component has hook types
      // defined but no memoizedState, meaning no stateful hooks (e.g. useState)
      // are used. `useContext` is an example of a state-less hook because it
      // does not mount any hook state onto the fiber's memoizedState field.
      //
      // However, as of writing, because our react adapter inserts a
      // useSyncExternalStore into all components, all components have memoized
      // state and so this condition is never hit. However, I'm leaving the test
      // to capture this unique behavior to hopefully catch any errors caused by
      // not understanding or handling this in the future.

      const sig = signal(0);
      const MyContext = createContext(0);

      function Child() {
        const value = useContext(MyContext);
        return (
          <div>
            {sig} {value}
          </div>
        );
      }

      let updateContext: () => void;
      function App() {
        const [value, setValue] = useState(0);
        updateContext = () => setValue(value + 1);

        return (
          <MyContext.Provider value={value}>
            <Child />
          </MyContext.Provider>
        );
      }

      await render(<App />);
      expect(scratch.innerHTML).to.equal("<div>0 0</div>");

      await act(() => {
        sig.value++;
      });
      expect(scratch.innerHTML).to.equal("<div>1 0</div>");

      await act(() => {
        updateContext();
      });
      expect(scratch.innerHTML).to.equal("<div>1 1</div>");
    });

    it("should minimize rerenders when passing signals through context", async () => {
      function spyOn<P = { children?: React.ReactNode }>(
        c: FunctionComponent<P>
      ) {
        return vi.fn(c);
      }

      // Manually read signal value below so we can watch whether components rerender
      const Origin = spyOn(function Origin() {
        const origin = useContext(URLModelContext).origin;
        return <span>{origin.value}</span>;
      });

      const Pathname = spyOn(function Pathname() {
        const pathname = useContext(URLModelContext).pathname;
        return <span>{pathname.value}</span>;
      });

      const Search = spyOn(function Search() {
        const search = useContext(URLModelContext).search;
        return <span>{search.value}</span>;
      });

      // Never reads signal value during render so should never rerender
      const UpdateURL = spyOn(function UpdateURL() {
        const update = useContext(URLModelContext).update;
        return (
          <button
            onClick={() => {
              update((newURL) => {
                newURL.search = newURL.search === "?a=1" ? "?a=2" : "?a=1";
              });
            }}
          >
            update
          </button>
        );
      });

      interface URLModel {
        origin: ReadonlySignal<string>;
        pathname: ReadonlySignal<string>;
        search: ReadonlySignal<string>;
        update(updater: (newURL: URL) => void): void;
      }

      // Also never reads signal value during render so should never rerender
      const URLModelContext = createContext<URLModel>(null as any);
      const URLModelProvider = spyOn(function SignalProvider({ children }) {
        const url = useSignal(new URL("https://domain.com/test?a=1"));
        const modelRef = useRef<URLModel | null>(null);

        if (modelRef.current == null) {
          modelRef.current = {
            origin: computed(() => url.value.origin),
            pathname: computed(() => url.value.pathname),
            search: computed(() => url.value.search),
            update(updater) {
              const newURL = new URL(url.value);
              updater(newURL);
              url.value = newURL;
            },
          };
        }

        return (
          <URLModelContext.Provider value={modelRef.current}>
            {children}
          </URLModelContext.Provider>
        );
      });

      function App() {
        return (
          <URLModelProvider>
            <p>
              <Origin />
              <Pathname />
              <Search />
            </p>
            <UpdateURL />
          </URLModelProvider>
        );
      }

      await render(<App />);

      const url = scratch.querySelector("p")!;
      expect(url.textContent).toBe("https://domain.com/test?a=1");
      expect(URLModelProvider).toHaveBeenCalledTimes(1);
      expect(Origin).toHaveBeenCalledTimes(1);
      expect(Pathname).toHaveBeenCalledTimes(1);
      expect(Search).toHaveBeenCalledTimes(1);

      await act(() => {
        scratch.querySelector("button")!.click();
      });

      expect(url.textContent).toBe("https://domain.com/test?a=2");
      expect(URLModelProvider).toHaveBeenCalledTimes(1);
      expect(Origin).toHaveBeenCalledTimes(1);
      expect(Pathname).toHaveBeenCalledTimes(1);
      expect(Search).toHaveBeenCalledTimes(2);
    });
    it("should not subscribe to computed signals only created and not used", async () => {
      const sig = signal(0);
      const childSpy = vi.fn();
      const parentSpy = vi.fn();

      function Child({ num }: { num: Signal<number> }) {
        childSpy();
        return <p>{num.value}</p>;
      }

      function Parent({ num }: { num: Signal<number> }) {
        parentSpy();
        const sig2 = useComputed(() => num.value + 1);
        return <Child num={sig2} />;
      }

      await render(<Parent num={sig} />);
      expect(scratch.innerHTML).toBe("<p>1</p>");
      expect(parentSpy).toHaveBeenCalledTimes(1);
      expect(childSpy).toHaveBeenCalledTimes(1);

      await act(() => {
        sig.value += 1;
      });
      expect(scratch.innerHTML).toBe("<p>2</p>");
      expect(parentSpy).toHaveBeenCalledTimes(1);
      expect(childSpy).toHaveBeenCalledTimes(2);
    });

    it("should properly subscribe and unsubscribe to conditionally rendered computed signals ", async () => {
      const computedDep = signal(0);
      const renderComputed = signal(true);
      const renderSpy = vi.fn();

      function App() {
        renderSpy();
        const computed = useComputed(() => computedDep.value + 1);
        return renderComputed.value ? <p>{computed.value}</p> : null;
      }

      await render(<App />);
      expect(scratch.innerHTML).toBe("<p>1</p>");
      expect(renderSpy).toHaveBeenCalledTimes(1);

      await act(() => {
        computedDep.value += 1;
      });
      expect(scratch.innerHTML).toBe("<p>2</p>");
      expect(renderSpy).toHaveBeenCalledTimes(2);

      await act(() => {
        renderComputed.value = false;
      });
      expect(scratch.innerHTML).toBe("");
      expect(renderSpy).toHaveBeenCalledTimes(3);

      await act(() => {
        computedDep.value += 1;
      });
      expect(scratch.innerHTML).toBe("");
      expect(renderSpy).toHaveBeenCalledTimes(3); // Should not be called again
    });

    describe("useSignal()", () => {
      it("should create a signal from a primitive value", async () => {
        function App() {
          const count = useSignal(1);
          return (
            <div>
              {count}
              <button onClick={() => count.value++}>Increment</button>
            </div>
          );
        }

        await render(<App />);
        expect(scratch.textContent).to.equal("1Increment");

        await act(() => {
          scratch.querySelector("button")!.click();
        });
        expect(scratch.textContent).to.equal("2Increment");
      });
    });

    describe("useSignalEffect()", () => {
      it("should be invoked after commit", async () => {
        const ref = createRef<HTMLDivElement>();
        const sig = signal("foo");
        const spy = vi.fn();
        let count = 0;

        function App() {
          useSignalEffect(() =>
            spy(
              sig.value,
              ref.current,
              ref.current!.getAttribute("data-render-id")
            )
          );
          return (
            <p ref={ref} data-render-id={count++}>
              {sig.value}
            </p>
          );
        }

        await render(<App />);
        expect(scratch.textContent).toBe("foo");

        expect(spy).toHaveBeenCalledWith("foo", scratch.firstElementChild, "0");

        spy.mockReset();

        await act(() => {
          sig.value = "bar";
        });

        expect(scratch.textContent).toBe("bar");

        expect(spy).toHaveBeenCalledWith(
          "bar",
          scratch.firstElementChild,
          isReact16 && isProd ? "1" : "0"
        );
      });

      it("should invoke any returned cleanup function for updates", async () => {
        const ref = createRef<HTMLDivElement>();
        const sig = signal("foo");
        const spy = vi.fn();
        const cleanup = vi.fn();
        let count = 0;

        function App() {
          useSignalEffect(() => {
            const id = ref.current!.getAttribute("data-render-id");
            const value = sig.value;
            spy(value, ref.current, id);
            return () => cleanup(value, ref.current, id);
          });
          return (
            <p ref={ref} data-render-id={count++}>
              {sig.value}
            </p>
          );
        }

        await render(<App />);

        expect(cleanup).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith("foo", scratch.firstElementChild, "0");
        spy.mockReset();

        await act(() => {
          sig.value = "bar";
        });

        expect(scratch.textContent).toBe("bar");

        const child = scratch.firstElementChild;

        expect(cleanup).toHaveBeenCalledWith("foo", child, "0");

        expect(spy).toHaveBeenCalledWith(
          "bar",
          child,
          isReact16 && isProd ? "1" : "0"
        );
      });

      it("should invoke any returned cleanup function for unmounts", async () => {
        const ref = createRef<HTMLDivElement>();
        const sig = signal("foo");
        const spy = vi.fn();
        const cleanup = vi.fn();

        function App() {
          useSignalEffect(() => {
            const value = sig.value;
            spy(value, ref.current);
            return () => cleanup(value, ref.current);
          });
          return <p ref={ref}>{sig.value}</p>;
        }

        await render(<App />);

        const child = scratch.firstElementChild;

        expect(scratch.innerHTML).toBe("<p>foo</p>");
        expect(cleanup).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith("foo", child);
        spy.mockReset();

        await act(() => {
          root.unmount();
        });

        expect(scratch.innerHTML).toBe("");
        expect(spy).not.toHaveBeenCalled();
        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(cleanup).toHaveBeenCalledWith("foo", isReact16 ? child : null);
      });
    });
  });
});
