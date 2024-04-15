import { defer, pick } from "radash";
import { createRoot } from "react-dom/client";
import { act as reactAct } from "react-dom/test-utils";
import { TestFunction, afterEach, it } from "vitest";

// let prevAct = Promise.resolve();
// const concurrentAct = (callback: () => unknown): Promise<void> =>
//   (prevAct = prevAct.finally(async () => {
//     await reactAct(callback);
//   }));

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
    await reactAct(() => {
      reactRoot.unmount();
    });
    root.innerHTML = "";
  };
  return {
    root,
    reactRoot: () => ({
      ...reactRoot,
      render: async (data: React.ReactNode) => {
        await reactAct(() => reactRoot.render(data));
      },
    }),
    recreateRoot: () => {
      reactRoot = createRoot(root);
    },
    dispose,
    act: reactAct,
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

export const itRenderer = Object.assign(
  function isRenderer(
    name: string,
    callback: (props: WithRendererProps) => unknown
  ) {
    return it(name, withRenderer(callback));
  },
  {
    only: (name: string, callback: (props: WithRendererProps) => unknown) =>
      it.only(name, withRenderer(callback)),
  }
);
