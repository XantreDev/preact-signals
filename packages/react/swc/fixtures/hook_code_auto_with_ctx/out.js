'use strict';
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
const useAboba = ()=>{
    var _effect = _useSignals();
    try {
        const counter = useSignal(0);
        console.log(counter.value);
    } finally{
        _effect.f();
    }
};
// [TODO]: fix inline comments
/**
 * @useSignals
 */ const unknown = ()=>{
    var _effect = _useSignals();
    try {
        return undefined;
    } finally{
        _effect.f();
    }
};
const Component = ()=>{
    var _effect = _useSignals();
    try {
        a.value;
        return <></>;
    } finally{
        _effect.f();
    }
};
