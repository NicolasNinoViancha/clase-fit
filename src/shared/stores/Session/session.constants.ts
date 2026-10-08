import { MobileStorageModels } from "@/core/mobileStorage";

import { SessionStoreModels } from "./session.models";

export const SESSION_INITIAL_STATE: SessionStoreModels.State = {
  session: null,
};

export const SESSION_STORE_KEY = MobileStorageModels.PERSISTENT_STORES.SESSION;
