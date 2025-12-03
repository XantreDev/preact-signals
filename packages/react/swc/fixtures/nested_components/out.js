import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
function Asdjsadf() {
    var _effect = _useSignals();
    try {
        /**
     * @useSignals
     */ function B() {
            var _effect = _useSignals();
            try {
                return <div/>;
            } finally{
                _effect.f();
            }
        }
        ;
        /**
     * @useSignals
     */ function c() {
            var _effect = _useSignals();
            try {
                return 5;
            } finally{
                _effect.f();
            }
        }
        ;
        return <div/>;
    } finally{
        _effect.f();
    }
}
