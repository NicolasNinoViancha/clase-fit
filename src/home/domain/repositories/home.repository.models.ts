import { GymClasses } from "../entities/GymClasses.entity";

export namespace HomeRepositoryModels {
  export enum URLs {
    LIST_GYM_CLASSES = "/gymClasses",
    BOOK_GYM_CLASS = "/gymClasses/book",
  }

  export interface ParamsWriteBookGymClass {
    gymClassId: string;
    userId: string;
  }

  export interface ParamsBookGymClass extends ParamsWriteBookGymClass {
    gymClasses: GymClasses.Entity[];
  }

  export interface Query {
    getListGymClasses(): Promise<GymClasses.Entity[]>;
  }

  export interface Write {
    bookGymClass(params: ParamsWriteBookGymClass): Promise<boolean>;
  }
}
