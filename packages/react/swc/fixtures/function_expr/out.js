import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
var C = function() {
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
};
var C2 = function C3() {
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
};
