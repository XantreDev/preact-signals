export function warn(msg: string, ...args: any[]) {
  console.warn(`[preact-signals warn] ${msg}`, ...args);
}
