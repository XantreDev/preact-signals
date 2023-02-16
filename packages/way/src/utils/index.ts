type AnyRecord = Record<any, any>;

export const createObject = <T extends AnyRecord>() => Object.create(null) as T;
