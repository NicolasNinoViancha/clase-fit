import { HttpClientError } from "../http.client.error";
import { HttpClientModels } from "../http.client.models";

const FAKE_USERS = [
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

export const usersResponse: HttpClientModels.FakeResponse = ({
  method,
  params,
}) => {
  if (method !== HttpClientModels.METHOD.GET) {
    throw new HttpClientError({
      message: `/users does not support the "${method}" method`,
      details: { method },
    });
  }

  const id = params?.id;

  if (!id) {
    return FAKE_USERS;
  }

  const user = FAKE_USERS.find((fakeUser) => fakeUser.id === String(id));

  if (!user) {
    throw new HttpClientError({
      message: "User not found",
      details: { id },
    });
  }

  return user;
};
