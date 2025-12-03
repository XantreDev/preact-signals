import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
const A = ()=>{
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
};
const Cecek = ()=>{
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
};
