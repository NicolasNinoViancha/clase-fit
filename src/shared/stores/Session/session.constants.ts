import type { SessionEntity } from "@/core/entities/Session.entity";
import { MobileStorageModels } from "@/core/mobileStorage";

import { SessionStoreModels } from "./session.models";

export const SESSION_INITIAL_USER: SessionEntity.User = {
  token: "",
  id: "",
  email: "",
  fullName: "",
};

export const SESSION_INITIAL_STATE: SessionStoreModels.State = {
  session: {
    isAuth: false,
    user: SESSION_INITIAL_USER,
  },
};

export const SESSION_STORE_KEY = MobileStorageModels.PERSISTENT_STORES.SESSION;
