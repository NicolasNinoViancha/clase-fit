import { createMMKV } from "react-native-mmkv";
import type { MMKV } from "react-native-mmkv";

import { MobileStorageModels } from "./mobileStorage.models";

class MobileStorage implements MobileStorageModels.MobileStorage {
  static MOBILE_STORAGE_INSTANCE = createMMKV();
  private readonly _storage: MMKV;

  constructor() {
    this._storage = MobileStorage.MOBILE_STORAGE_INSTANCE;
  }

  getItem<T>(key: MobileStorageModels.ALL_STORAGE_KEYS): T | undefined {
    const hasKey = this._storage.contains(key);
    if (!hasKey) return undefined;
    const json = this._storage.getString(key);
    if (!json) return undefined;
    return JSON.parse(json);
  }

  setItem<T>(key: MobileStorageModels.ALL_STORAGE_KEYS, value: T): void {
    this._storage.set(key, JSON.stringify(value));
  }

  removeItem(key: MobileStorageModels.ALL_STORAGE_KEYS): void {
    this._storage.remove(key);
  }

  clearStorage(): void {
    this._storage.clearAll();
  }
}

const MOBILE_STORAGE_INSTANCE = MobileStorage.MOBILE_STORAGE_INSTANCE;

export { MOBILE_STORAGE_INSTANCE };
export default new MobileStorage();
