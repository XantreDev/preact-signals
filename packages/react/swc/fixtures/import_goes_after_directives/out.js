'use strict';

import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
const Bebe = ()=>{
    var _effect = _useSignals();
    try {
        return <div>{a.value}</div>;
    } finally{
        _effect.f();
    }
}
