import { HttpClientError, HttpClientModels } from "@/core/httpClient";
import { GymClasses } from "@/home/domain/entities/GymClasses.entity";
import { HomeRepositoryModels } from "@/home/domain/repositories/home.repository.models";

import { GymClassesAdapter } from "../adapters/GymClasses.adapter";
import { GymClassesDTO } from "../DTOs/GymClasses.dto";

export class HomeQueryRepository implements HomeRepositoryModels.Query {
  constructor(private readonly _httpClient: HttpClientModels.HttpClient) {}

  async getListGymClasses(): Promise<GymClasses.Entity[]> {
    try {
      const response = await this._httpClient.request<GymClassesDTO.Dto[]>({
        url: HomeRepositoryModels.URLs.LIST_GYM_CLASSES,
        method: HttpClientModels.METHOD.GET,
      });

      return GymClassesAdapter.toDomainList(response);
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error;
      }

      throw new HttpClientError({
        message: "The gym classes could not be read",
        details: error,
      });
    }
  }
}
