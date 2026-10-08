import type { GymClasses } from "@/home/domain/entities/GymClasses.entity";

export namespace GymClassesStoreModels {
  export type State = {
    gymClasses: GymClasses.Entity[];
    fetchedAt: number | null;
  };

  type Action = {
    setGymClasses(gymClasses: GymClasses.Entity[]): void;
    clearGymClasses(): void;
  };

  export type Store = State & Action;
}
