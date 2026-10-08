import type { SessionEntity } from "@/core/entities/Session.entity";
import type { GymClasses } from "@/home/domain/entities/GymClasses.entity";
import type { ThemedBannerProps } from "@/shared/components/themed-banner";

export namespace HomeScreenModels {
  export interface Section {
    dayOffset: GymClasses.DAY_OFFSET;
    label: string;
    date: string;
    gymClasses: GymClasses.Entity[];
  }

  export interface Banner {
    type: ThemedBannerProps["type"];
    message: string;
  }

  export interface ViewModel {
    user: SessionEntity.User;
    sections: Section[];
    banner: Banner | null;
    bookingGymClassId: string | null;
    isLoading: boolean;
    isError: boolean;
    hasGymClasses: boolean;
    onSignOut: () => void;
    onRetry: () => void;
    onReserve: (gymClassId: string) => void;
    onDismissBanner: () => void;
  }
}
