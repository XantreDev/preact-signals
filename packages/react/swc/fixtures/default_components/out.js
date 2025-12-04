import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
export default function() {
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
}
export default (()=>{
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
});
