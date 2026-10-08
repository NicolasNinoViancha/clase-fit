import type { SessionEntity } from "@/core/entities/Session.entity";

//@toDo: replace this hardcoded check with auth/domain/useCases/signIn.useCase.ts once there is a real endpoint
export const DEMO_CREDENTIALS = {
  email: "admin@clasefit.com",
  password: "clasefit123",
};

export const DEMO_SESSION: SessionEntity.Entity = {
  user: {
    token: "demo-token",
    id: "1",
    email: DEMO_CREDENTIALS.email,
    fullName: "Admin Clase Fit",
  },
};
