import { useSignals } from "./tracking";
import { wrapIntoProxy, RewriteCall } from "react-fast-hoc";

export const withTrackSignals: ReturnType<typeof wrapIntoProxy> = wrapIntoProxy(
  new RewriteCall((props) => {
    const tracker = useSignals();
    try {
      return props.renderComponent(...props.args);
    } finally {
      tracker.f();
    }
  })
);
