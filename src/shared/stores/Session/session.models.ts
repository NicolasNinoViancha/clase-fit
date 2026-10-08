import type { SessionEntity } from "@/core/entities/Session.entity";

export namespace SessionStoreModels {
  export type State = {
    session: SessionEntity.Entity | null;
  };

  type Action = {
    setSession(session: SessionEntity.Entity): void;
    clearSession(): void;
  };

  export type Store = State & Action;
}
