import type { SessionEntity } from "@/core/entities/Session.entity";

export namespace HomeScreenModels {
  export interface ViewModel {
    user: SessionEntity.User | null;
    onSignOut: () => void;
  }
}
