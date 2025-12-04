'use strict';
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
const useAboba = ()=>{
    var _effect = _useSignals(2);
    try {
        const counter = useSignal(0);
        console.log(counter.value);
    } finally{
        _effect.f();
    }
};
/**
 * @useSignals
 */ const unknown = ()=>{
    _useSignals();
    return undefined;
};
const Component = ()=>{
    var _effect = _useSignals(1);
    try {
        a.value;
        return <></>;
    } finally{
        _effect.f();
    }
};
