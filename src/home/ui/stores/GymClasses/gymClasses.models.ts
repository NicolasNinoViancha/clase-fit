import type { GymClasses } from "@/home/domain/entities/GymClasses.entity";

export namespace GymClassesStoreModels {
  export interface ParamsBookGymClass {
    gymClassId: string;
    userId: string;
  }

  export type State = {
    gymClasses: GymClasses.Entity[];
    fetchedAt: number | null;
  };

  type Action = {
    setGymClasses(gymClasses: GymClasses.Entity[]): void;
    bookGymClass(params: ParamsBookGymClass): void;
    clearGymClasses(): void;
  };

  export type Store = State & Action;
}
