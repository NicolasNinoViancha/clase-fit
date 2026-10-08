import { createJSONStorage } from "zustand/middleware";

import { MobileStorage, MobileStorageModels } from "@/core/mobileStorage";

/**
 * @warn MobileStorage already JSON-encodes on write and decodes on read, and
 * @warn createJSONStorage does the same on top. Both layers cancel out, so the
 * @warn value round-trips correctly — never remove just one of them.
 * @doc The ts-ignore lines are required because keys are PERSISTENT_STORES enum
 * @doc members rather than the plain strings zustand's StateStorage declares.
 */
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
