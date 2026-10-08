export interface FakeUser {
  id: string;
  email: string;
  full_name: string;
  token: string;
}

export const FAKE_USERS: FakeUser[] = [
  {
    id: "1",
    email: "admin@clasefit.com",
    full_name: "Admin Clase Fit",
    token: "fake-token-1",
  },
  {
    id: "2",
    email: "coach@clasefit.com",
    full_name: "Coach Clase Fit",
    token: "fake-token-2",
  },
];
