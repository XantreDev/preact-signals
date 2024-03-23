"use client";

import { withTrackSignals } from "@preact-signals/safe-react/manual";

/**
 *
 * @noUseSignals
 */
export const PureComponent = withTrackSignals(() => {
  console.log("PureComponent");

  return (
    <div>
      <h1>PureComponent</h1>
    </div>
  );
});
