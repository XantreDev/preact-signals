import { defer, pick } from "radash";
import { createRoot } from "react-dom/client";
import { act as reactAct } from "react-dom/test-utils";
import { TestFunction, afterEach, it } from "vitest";

const raf = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

let prevAct = Promise.resolve();
const _act = async (callback: () => unknown): Promise<void> => {
  const res = reactAct(callback);

  await res;
  await raf();
  await res;
};
const act = (callback: () => unknown): Promise<void> =>
  (prevAct = prevAct.finally(() => _act(callback)));

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const _createRenderer = () => {
  const root = (() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return el;
  })();
  let reactRoot = createRoot(root);

  const dispose = async () => {
    await act(() => {
      reactRoot.unmount();
    });
    root.innerHTML = "";
  };
  return {
    root,
    reactRoot: () => ({
      ...reactRoot,
      render: async (data: React.ReactNode) => {
        await act(() => reactRoot.render(data));
      },
    }),
    recreateRoot: () => {
      reactRoot = createRoot(root);
    },
    dispose,
    act,
  };
};

export const createRenderer = () => {
  const renderer = _createRenderer();

  afterEach(async () => {
    await renderer.dispose();
    renderer.recreateRoot();
  });
  return pick(renderer, ["root", "reactRoot", "act"]);
};

type WithRendererProps = ReturnType<typeof createRenderer> &
  Pick<Parameters<TestFunction<unknown>>[0], "expect">;

export const withRenderer =
  (callback: (renderer: WithRendererProps) => unknown) =>
  async (arg: Parameters<TestFunction<unknown>>[0]) =>
    await defer(async (cleanup) => {
      const renderer = _createRenderer();
      cleanup(() => renderer.dispose(), { rethrow: true });
      return await callback({
        expect: arg.expect,
        ...pick(renderer, ["act", "reactRoot", "root"]),
      });
    });

export const itRenderer = (
  name: string,
  callback: (props: WithRendererProps) => unknown
) => it(name, withRenderer(callback));
