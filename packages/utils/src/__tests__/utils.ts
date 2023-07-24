import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach } from "vitest";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createRenderer = () => {
  const root = (() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return el;
  })();
  let reactRoot = createRoot(root);

  afterEach(async () => {
    reactRoot.unmount();
    await sleep(0);
    root.innerHTML = "";
    reactRoot = createRoot(root);
  });
  return { root, reactRoot: () => reactRoot, act };
};
