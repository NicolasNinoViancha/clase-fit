export namespace GymClassesDTO {
  export interface Dto {
    id?: string;
    nombre?: string;
    instructor?: string;
    diaOffset?: number;
    hora?: string;
    duracionMin?: number;
    cupoTotal?: number;
    ocupados?: number;
    usuariosReservados?: string[];
  }
}
