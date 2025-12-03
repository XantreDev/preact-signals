import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
const Cec = memo(()=>{
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
});
// hocs should be transformed
const Cyc = React.lazy(React.memo(()=>{
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
}), {});
