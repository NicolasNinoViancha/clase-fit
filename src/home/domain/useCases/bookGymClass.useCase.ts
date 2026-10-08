import { GymClasses } from "../entities/GymClasses.entity";
import { HomeRepositoryModels } from "../repositories/home.repository.models";
import { BookGymClassValidator } from "./validators/bookGymClass.validator";

const MAX_BOOKINGS_PER_DAY = 2;

export class BookGymClassUseCase {
  constructor(private readonly _repository: HomeRepositoryModels.Write) {}

  async execute({
    gymClasses,
    ...params
  }: HomeRepositoryModels.ParamsBookGymClass): Promise<boolean> {
    try {
      const { gymClassId, userId } = BookGymClassValidator.validate(params);
      const gymClass = gymClasses.find(({ id }) => id === gymClassId);

      if (!gymClass) {
        throw new Error("The gym class is not in the schedule");
      }

      if (gymClass.bookedUserIds.includes(userId)) {
        throw new Error(GymClasses.BOOKING_ERROR.ALREADY_BOOKED);
      }

      if (gymClass.isFull) {
        throw new Error(GymClasses.BOOKING_ERROR.NO_SPOTS);
      }

      const bookedOnSameDay = gymClasses.filter(
        (candidate) =>
          candidate.dayOffset === gymClass.dayOffset &&
          candidate.bookedUserIds.includes(userId),
      );

      if (bookedOnSameDay.length >= MAX_BOOKINGS_PER_DAY) {
        throw new Error(GymClasses.BOOKING_ERROR.DAILY_LIMIT);
      }

      return await this._repository.bookGymClass({ gymClassId, userId });
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
