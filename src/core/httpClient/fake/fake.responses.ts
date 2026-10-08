import { HttpClientModels } from "../http.client.models";
import { gymClassesResponse } from "./fake.gymClasses";
import { usersResponse } from "./fake.users";

export const FAKE_RESPONSES: Record<
  string,
  HttpClientModels.FakeResponse | undefined
> = {
  "/gymClasses": gymClassesResponse,
  "/users": usersResponse,
};
