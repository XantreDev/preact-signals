// should be transformed
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
function A() {
  var _effect = _useSignals();
  try {
    return <div />;
  } finally {
    _effect.f();
  }
}
