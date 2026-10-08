import { GymClasses } from "@/home/domain/entities/GymClasses.entity";

import { BOOKING_COPY, SCHEDULE_DAY_OFFSETS } from "./home.constants";

const BOOKING_ERROR_MESSAGES: Record<GymClasses.BOOKING_ERROR, string> = {
  [GymClasses.BOOKING_ERROR.ALREADY_BOOKED]: BOOKING_COPY.alreadyBooked,
  [GymClasses.BOOKING_ERROR.NO_SPOTS]: BOOKING_COPY.noSpots,
  [GymClasses.BOOKING_ERROR.DAILY_LIMIT]: BOOKING_COPY.dailyLimit,
};

export function resolveBookingMessage(error: unknown): string {
  const reason = error instanceof Error ? error.message : "";

  return (
    BOOKING_ERROR_MESSAGES[reason as GymClasses.BOOKING_ERROR] ??
    BOOKING_COPY.failed
  );
}

export function resolveStartsAt(
  dayOffset: number,
  hour: string,
  from: Date = new Date(),
): Date {
  const [hours, minutes] = hour.split(":").map(Number);
  const startsAt = new Date(from);

  startsAt.setDate(startsAt.getDate() + dayOffset);
  startsAt.setHours(hours, minutes, 0, 0);

  return startsAt;
}

export function getSectionDate(
  dayOffset: number,
  from: Date = new Date(),
): string {
  const date = new Date(from);

  date.setDate(date.getDate() + dayOffset);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function isSameCalendarDay(
  fetchedAt: number | null,
  now: Date = new Date(),
): boolean {
  if (!fetchedAt) {
    return false;
  }

  const fetchedDate = new Date(fetchedAt);

  return (
    fetchedDate.getFullYear() === now.getFullYear() &&
    fetchedDate.getMonth() === now.getMonth() &&
    fetchedDate.getDate() === now.getDate()
  );
}

export function selectUpcomingGymClasses(
  gymClasses: GymClasses.Entity[],
  now: Date = new Date(),
): GymClasses.Entity[] {
  return gymClasses
    .filter((gymClass) => {
      const isVisibleDay = SCHEDULE_DAY_OFFSETS.some(
        (dayOffset) => dayOffset === gymClass.dayOffset,
      );

      if (!isVisibleDay) {
        return false;
      }

      return (
        resolveStartsAt(gymClass.dayOffset, gymClass.hour, now).getTime() >
        now.getTime()
      );
    })
    .sort(
      (current, next) =>
        current.dayOffset - next.dayOffset ||
        current.hour.localeCompare(next.hour),
    );
}
