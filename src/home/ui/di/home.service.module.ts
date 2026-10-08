import { httpClient } from "@/core/httpClient";
import { GetListGymClassesUseCase } from "@/home/domain/useCases/getListGymClasses.useCase";
import { HomeQueryRepository } from "@/home/infrastructure/repositories/home.query.repository";

const homeQueryRepository = new HomeQueryRepository(httpClient);

export const homeServiceModule = {
  queries: {
    getListGymClasses: new GetListGymClassesUseCase(homeQueryRepository),
  },
} as const;
