import { HttpClientModels } from "../http.client.models";
import { usersResponse } from "./fake.users";

/**
 * @doc Maps every faked endpoint to the function that answers it. An url that
 * @doc is not registered here resolves to `undefined` and makes the fake client
 * @doc fail, instead of silently returning an empty response.
 */
export const FAKE_RESPONSES: Record<
  string,
  HttpClientModels.FakeResponse | undefined
> = {
  "/users": usersResponse,
};
