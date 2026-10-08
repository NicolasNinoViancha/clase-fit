import { HttpClientModels } from "../http.client.models";
import { usersResponse } from "./auth/users/fake.users";
import { bookGymClassResponse } from "./home/gymClasses/fake.bookGymClass";
import { listGymClassesResponse } from "./home/gymClasses/fake.listGymClasses";

export const FAKE_RESPONSES: Record<
  string,
  HttpClientModels.FakeResponse | undefined
> = {
  "/gymClasses": listGymClassesResponse,
  "/gymClasses/book": bookGymClassResponse,
  "/users": usersResponse,
};
