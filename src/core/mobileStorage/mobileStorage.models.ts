export namespace MobileStorageModels {
  //@doc: individual keys
  export enum STORAGE_KEYS {
    EXAMPLE = "EXAMPLE",
  }

  //@doc: store keys, consumed by the zustand persist middleware
  export enum PERSISTENT_STORES {
    SESSION = "SESSION",
    GYM_CLASSES = "GYM_CLASSES",
  }

  export type ALL_STORAGE_KEYS = STORAGE_KEYS | PERSISTENT_STORES;

  export interface MobileStorage {
    getItem<T>(key: ALL_STORAGE_KEYS): T | undefined;
    setItem<T>(key: ALL_STORAGE_KEYS, value: T): void;
    removeItem(key: ALL_STORAGE_KEYS): void;
    clearStorage(): void;
  }
}
