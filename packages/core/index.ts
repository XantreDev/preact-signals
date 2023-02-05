// always should be first, if it will be later funny bugs appears))
import "@one-render/monkeypatch";

// Global assumption - signals are not replaceable
export { hookScope } from "./hoc/scopedHooks";
export type { Signalify } from "./hoc/types";
export { withOneRender } from "./hoc/withOneRender";
export { isSignal } from "./signalUtils";

