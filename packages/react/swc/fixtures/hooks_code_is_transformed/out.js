'use strict';

import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";

const useAboba = () => {
  var _effect = _useSignals();
  try {
    return a.value
  } finally {
    _effect.f()
  }
}
