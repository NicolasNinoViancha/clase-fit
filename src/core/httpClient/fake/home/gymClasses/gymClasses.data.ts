export interface FakeGymClass {
  id: string;
  nombre: string;
  instructor: string;
  diaOffset: number;
  hora: string;
  duracionMin: number;
  cupoTotal: number;
  ocupados: number;
  usuariosReservados: string[];
}

export const FAKE_GYM_CLASSES: FakeGymClass[] = [
  { id: "C-01", nombre: "Spinning", instructor: "Andrés Restrepo", diaOffset: 0, hora: "06:00", duracionMin: 45, cupoTotal: 20, ocupados: 18, usuariosReservados: [] },
  { id: "C-02", nombre: "Funcional", instructor: "Camila Ospina", diaOffset: 0, hora: "18:00", duracionMin: 60, cupoTotal: 15, ocupados: 9, usuariosReservados: [] },
  { id: "C-03", nombre: "Yoga", instructor: "Valentina Ríos", diaOffset: 0, hora: "19:00", duracionMin: 60, cupoTotal: 12, ocupados: 12, usuariosReservados: [] },
  { id: "C-04", nombre: "Rumba", instructor: "Julián Mejía", diaOffset: 0, hora: "20:00", duracionMin: 50, cupoTotal: 30, ocupados: 22, usuariosReservados: [] },
  { id: "C-05", nombre: "Spinning", instructor: "Andrés Restrepo", diaOffset: 1, hora: "06:00", duracionMin: 45, cupoTotal: 20, ocupados: 11, usuariosReservados: [] },
  { id: "C-06", nombre: "Funcional", instructor: "Camila Ospina", diaOffset: 1, hora: "07:00", duracionMin: 60, cupoTotal: 15, ocupados: 14, usuariosReservados: [] },
  { id: "C-07", nombre: "Yoga", instructor: "Valentina Ríos", diaOffset: 1, hora: "18:00", duracionMin: 60, cupoTotal: 12, ocupados: 5, usuariosReservados: [] },
  { id: "C-08", nombre: "Rumba", instructor: "Julián Mejía", diaOffset: 1, hora: "19:00", duracionMin: 50, cupoTotal: 30, ocupados: 30, usuariosReservados: [] },
  { id: "C-09", nombre: "Spinning", instructor: "Andrés Restrepo", diaOffset: 2, hora: "08:00", duracionMin: 45, cupoTotal: 20, ocupados: 13, usuariosReservados: [] },
  { id: "C-10", nombre: "Yoga", instructor: "Valentina Ríos", diaOffset: 2, hora: "09:00", duracionMin: 60, cupoTotal: 12, ocupados: 11, usuariosReservados: [] },
];
