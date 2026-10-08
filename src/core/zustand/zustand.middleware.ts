import { createJSONStorage } from "zustand/middleware";

import { MobileStorage, MobileStorageModels } from "@/core/mobileStorage";

export const zustandPersistentStorage = createJSONStorage(() => ({
  //@ts-ignore
  setItem: (key: MobileStorageModels.PERSISTENT_STORES, value: string) => {
    return MobileStorage.setItem(key, value);
  },
  //@ts-ignore
  getItem: (key: MobileStorageModels.PERSISTENT_STORES) => {
    const value = MobileStorage.getItem(key);
    return value ?? null;
  },
  //@ts-ignore
  removeItem: (key: MobileStorageModels.PERSISTENT_STORES) => {
    return MobileStorage.removeItem(key);
  },
}));
