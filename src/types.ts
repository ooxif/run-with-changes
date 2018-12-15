export type DeepReadonly<T> = T extends any[]
  ? IDeepReadonlyArray<T[number]>
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

export interface IDeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type DeepReadonlyObject<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>
};

export type SpawnOutput = [boolean, Buffer];
