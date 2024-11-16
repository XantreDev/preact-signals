export type Untracked = <T>(callback: () => T) => T;
export const untrackedPolyfill: Untracked;
