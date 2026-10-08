import { HttpClientError } from "../../../http.client.error";
import { HttpClientModels } from "../../../http.client.models";
import { FAKE_GYM_CLASSES } from "./gymClasses.data";

interface FakeBookGymClassBody {
  claseId?: string;
  usuarioId?: string;
}

export const bookGymClassResponse: HttpClientModels.FakeResponse<
  FakeBookGymClassBody,
  boolean
> = ({ method, data }) => {
  if (method !== HttpClientModels.METHOD.POST) {
    throw new HttpClientError({
      message: `/gymClasses/book does not support the "${method}" method`,
      details: { method },
    });
  }

  const claseId = data?.claseId;
  const usuarioId = data?.usuarioId;

  if (!claseId || !usuarioId) {
    throw new HttpClientError({
      message: "/gymClasses/book requires a claseId and a usuarioId",
      details: { claseId, usuarioId },
    });
  }

  const gymClass = FAKE_GYM_CLASSES.find(
    (fakeGymClass) => fakeGymClass.id === claseId,
  );

  if (!gymClass) {
    return false;
  }

  const isBookable =
    gymClass.ocupados < gymClass.cupoTotal &&
    !gymClass.usuariosReservados.includes(usuarioId);

  if (!isBookable) {
    return false;
  }

  gymClass.ocupados += 1;
  gymClass.usuariosReservados.push(usuarioId);

  return true;
};
