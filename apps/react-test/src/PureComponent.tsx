import { withTrackSignals } from "@preact-signals/safe-react/manual";

export const PureComponent = withTrackSignals(() => {
  console.log("PureComponent");

  return (
    <div>
      <h1>PureComponent</h1>
    </div>
  );
});
