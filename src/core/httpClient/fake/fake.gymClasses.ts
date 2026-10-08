import { HttpClientError } from "../http.client.error";
import { HttpClientModels } from "../http.client.models";

const FAKE_GYM_CLASSES = [
  { id: "C-01", nombre: "Spinning", instructor: "Andrés Restrepo", diaOffset: 0, hora: "06:00", duracionMin: 45, cupoTotal: 20, ocupados: 18 },
  { id: "C-02", nombre: "Funcional", instructor: "Camila Ospina", diaOffset: 0, hora: "18:00", duracionMin: 60, cupoTotal: 15, ocupados: 9 },
  { id: "C-03", nombre: "Yoga", instructor: "Valentina Ríos", diaOffset: 0, hora: "19:00", duracionMin: 60, cupoTotal: 12, ocupados: 12 },
  { id: "C-04", nombre: "Rumba", instructor: "Julián Mejía", diaOffset: 0, hora: "20:00", duracionMin: 50, cupoTotal: 30, ocupados: 22 },
  { id: "C-05", nombre: "Spinning", instructor: "Andrés Restrepo", diaOffset: 1, hora: "06:00", duracionMin: 45, cupoTotal: 20, ocupados: 11 },
  { id: "C-06", nombre: "Funcional", instructor: "Camila Ospina", diaOffset: 1, hora: "07:00", duracionMin: 60, cupoTotal: 15, ocupados: 14 },
  { id: "C-07", nombre: "Yoga", instructor: "Valentina Ríos", diaOffset: 1, hora: "18:00", duracionMin: 60, cupoTotal: 12, ocupados: 5 },
  { id: "C-08", nombre: "Rumba", instructor: "Julián Mejía", diaOffset: 1, hora: "19:00", duracionMin: 50, cupoTotal: 30, ocupados: 30 },
  { id: "C-09", nombre: "Spinning", instructor: "Andrés Restrepo", diaOffset: 2, hora: "08:00", duracionMin: 45, cupoTotal: 20, ocupados: 13 },
  { id: "C-10", nombre: "Yoga", instructor: "Valentina Ríos", diaOffset: 2, hora: "09:00", duracionMin: 60, cupoTotal: 12, ocupados: 11 },
];

export const gymClassesResponse: HttpClientModels.FakeResponse = ({
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
