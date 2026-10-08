import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandPersistentStorage } from "@/core/zustand";

import {
  GYM_CLASSES_INITIAL_STATE,
  GYM_CLASSES_STORE_KEY,
} from "./gymClasses.constants";
import { GymClassesStoreModels } from "./gymClasses.models";

export const useGymClassesStore = create<GymClassesStoreModels.Store>()(
  persist(
    (set) => ({
      ...GYM_CLASSES_INITIAL_STATE,
      setGymClasses: (gymClasses) => set({ gymClasses, fetchedAt: Date.now() }),
      clearGymClasses: () => set({ ...GYM_CLASSES_INITIAL_STATE }),
    }),
    {
      name: GYM_CLASSES_STORE_KEY,
      storage: zustandPersistentStorage,
      partialize: ({ gymClasses, fetchedAt }) => ({ gymClasses, fetchedAt }),
    },
  ),
);
