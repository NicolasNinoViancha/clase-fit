import { GymClasses } from "../entities/GymClasses.entity";
import { HomeRepositoryModels } from "../repositories/home.repository.models";

export class GetListGymClassesUseCase {
  constructor(private readonly _repository: HomeRepositoryModels.Query) {}

  async execute(): Promise<GymClasses.Entity[]> {
    try {
      return await this._repository.getListGymClasses();
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
