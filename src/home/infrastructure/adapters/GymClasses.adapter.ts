import { z } from "zod";

import { GymClasses } from "@/home/domain/entities/GymClasses.entity";

import { GymClassesDTO } from "../DTOs/GymClasses.dto";

const HOUR_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const GymClassesDtoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  instructor: z.string().min(1),
  diaOffset: z.number().int().nonnegative(),
  hora: z.string().regex(HOUR_PATTERN),
  duracionMin: z.number().int().positive(),
  cupoTotal: z.number().int().nonnegative(),
  ocupados: z.number().int().nonnegative(),
  usuariosReservados: z.array(z.string()).default([]),
});

type GymClassesDtoValid = z.infer<typeof GymClassesDtoSchema>;

export class GymClassesAdapter {
  static toDomain(dto: GymClassesDTO.Dto): GymClasses.Entity {
    return GymClassesAdapter._toEntity(GymClassesDtoSchema.parse(dto));
  }

  static toDomainList(response: GymClassesDTO.Dto[]): GymClasses.Entity[] {
    if (!Array.isArray(response)) {
      throw new Error("The gym classes response is not a list");
    }

    return response.reduce<GymClasses.Entity[]>((entities, dto) => {
      const result = GymClassesDtoSchema.safeParse(dto);

      if (result.success) {
        entities.push(GymClassesAdapter._toEntity(result.data));
      }

      return entities;
    }, []);
  }

  private static _toEntity(dto: GymClassesDtoValid): GymClasses.Entity {
    return {
      id: dto.id,
      name: dto.nombre,
      instructor: dto.instructor,
      dayOffset: dto.diaOffset,
      hour: dto.hora,
      duration: dto.duracionMin,
      totalCapacity: dto.cupoTotal,
      occupied: dto.ocupados,
      isFull: dto.cupoTotal === dto.ocupados,
      bookedUserIds: dto.usuariosReservados,
    };
  }
}
