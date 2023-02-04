const f = () => ({
  current: {},
});

export { };

let res: any = null;
const fp = new Proxy(f, {
  apply(target, thisArg, args) {
    if (res) return res;
    res = target.apply(thisArg, args as any);
    return res;
  },
});

const v = fp().current;

Object.assign(v, { data: 10 });

console.log(fp());
