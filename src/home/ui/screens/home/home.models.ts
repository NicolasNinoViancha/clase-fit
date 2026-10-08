import type { SessionEntity } from "@/core/entities/Session.entity";
import type { GymClasses } from "@/home/domain/entities/GymClasses.entity";

export namespace HomeScreenModels {
  export interface Section {
    dayOffset: GymClasses.DAY_OFFSET;
    label: string;
    date: string;
    gymClasses: GymClasses.Entity[];
  }

  export interface ViewModel {
    user: SessionEntity.User;
    sections: Section[];
    isLoading: boolean;
    isError: boolean;
    hasGymClasses: boolean;
    onSignOut: () => void;
    onRetry: () => void;
    onReserve: () => void;
  }
}
