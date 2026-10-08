import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandPersistentStorage } from "@/core/zustand";

import { SESSION_INITIAL_STATE, SESSION_STORE_KEY } from "./session.constants";
import { SessionStoreModels } from "./session.models";

export const useSessionStore = create<SessionStoreModels.Store>()(
  persist(
    (set) => ({
      ...SESSION_INITIAL_STATE,
      setSession: (session) => set({ session }),
      clearSession: () => set({ ...SESSION_INITIAL_STATE }),
    }),
    {
      name: SESSION_STORE_KEY,
      storage: zustandPersistentStorage,
      partialize: ({ session }) => ({ session }),
    },
  ),
);
