import { z } from "zod";

import { HomeRepositoryModels } from "../../repositories/home.repository.models";

const BookGymClassSchema = z.object({
  gymClassId: z.string().min(1),
  userId: z.string().min(1),
});

export class BookGymClassValidator {
  static validate(
    params: HomeRepositoryModels.ParamsWriteBookGymClass,
  ): HomeRepositoryModels.ParamsWriteBookGymClass {
    return BookGymClassSchema.parse(params);
  }
}
