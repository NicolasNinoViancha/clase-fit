import { httpClient } from "@/core/httpClient";
import { BookGymClassUseCase } from "@/home/domain/useCases/bookGymClass.useCase";
import { GetListGymClassesUseCase } from "@/home/domain/useCases/getListGymClasses.useCase";
import { HomeQueryRepository } from "@/home/infrastructure/repositories/home.query.repository";
import { HomeWriteRepository } from "@/home/infrastructure/repositories/home.write.repository";

const homeQueryRepository = new HomeQueryRepository(httpClient);
const homeWriteRepository = new HomeWriteRepository(httpClient);

export const homeServiceModule = {
  queries: {
    getListGymClasses: new GetListGymClassesUseCase(homeQueryRepository),
  },
  write: {
    bookGymClass: new BookGymClassUseCase(homeWriteRepository),
  },
} as const;
