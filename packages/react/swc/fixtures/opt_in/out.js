/**
 * @useSignals
 */ import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
function a() {
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
}
/**
 * @useSignals
 */ const b = ()=>{
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
/**
 * @useSignals
 */ const c = function() {
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
/**
 * @useSignals
 */ const d = ()=>{
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
/**
 * @useSignals
 */ export function boba() {
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
}
/**
 * @useSignals
 */ export const boba2 = ()=>{
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
