import { HttpClientError, HttpClientModels } from "@/core/httpClient";
import { HomeRepositoryModels } from "@/home/domain/repositories/home.repository.models";

import { BookGymClassDTO } from "../DTOs/BookGymClass.dto";
import { BookGymClassPayload } from "../payloads/bookGymClass.payload";

export class HomeWriteRepository implements HomeRepositoryModels.Write {
  constructor(private readonly _httpClient: HttpClientModels.HttpClient) {}

  async bookGymClass(
    params: HomeRepositoryModels.ParamsWriteBookGymClass,
  ): Promise<boolean> {
    try {
      return await this._httpClient.request<boolean, BookGymClassDTO.Dto>({
        url: HomeRepositoryModels.URLs.BOOK_GYM_CLASS,
        method: HttpClientModels.METHOD.POST,
        data: BookGymClassPayload.toDto(params),
      });
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error;
      }

      throw new HttpClientError({
        message: "The gym class could not be booked",
        details: error,
      });
    }
  }
}
