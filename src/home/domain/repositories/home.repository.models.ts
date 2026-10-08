import { GymClasses } from "../entities/GymClasses.entity";

export namespace HomeRepositoryModels {
  export enum URLs {
    LIST_GYM_CLASSES = "/gymClasses",
  }

  export interface Query {
    getListGymClasses(): Promise<GymClasses.Entity[]>;
  }
}
