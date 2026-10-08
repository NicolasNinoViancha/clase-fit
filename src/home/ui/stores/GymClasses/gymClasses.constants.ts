import { MobileStorageModels } from "@/core/mobileStorage";

import { GymClassesStoreModels } from "./gymClasses.models";

export const GYM_CLASSES_INITIAL_STATE: GymClassesStoreModels.State = {
  gymClasses: [],
  fetchedAt: null,
};

export const GYM_CLASSES_STORE_KEY =
  MobileStorageModels.PERSISTENT_STORES.GYM_CLASSES;
