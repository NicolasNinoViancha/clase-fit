import { HttpClientError } from "../../../http.client.error";
import { HttpClientModels } from "../../../http.client.models";
import { FAKE_GYM_CLASSES } from "./gymClasses.data";

export const listGymClassesResponse: HttpClientModels.FakeResponse = ({
  method,
}) => {
  if (method !== HttpClientModels.METHOD.GET) {
    throw new HttpClientError({
      message: `/gymClasses does not support the "${method}" method`,
      details: { method },
    });
  }

  return FAKE_GYM_CLASSES;
};
