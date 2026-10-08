import { HomeRepositoryModels } from "@/home/domain/repositories/home.repository.models";

import { BookGymClassDTO } from "../DTOs/BookGymClass.dto";

export class BookGymClassPayload {
  static toDto({
    gymClassId,
    userId,
  }: HomeRepositoryModels.ParamsWriteBookGymClass): BookGymClassDTO.Dto {
    return {
      claseId: gymClassId,
      usuarioId: userId,
    };
  }
}
