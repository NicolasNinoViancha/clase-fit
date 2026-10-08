import { GymClasses } from "@/home/domain/entities/GymClasses.entity";

export enum HOME_QUERY_KEYS {
  LIST_GYM_CLASSES = "LIST_GYM_CLASSES",
}

export enum HOME_MUTATION_KEYS {
  BOOK_GYM_CLASS = "BOOK_GYM_CLASS",
}

export const BOOKING_BANNER_DURATION = 4000;

export const SCHEDULE_DAY_OFFSETS: readonly GymClasses.DAY_OFFSET[] = [
  GymClasses.DAY_OFFSET.TODAY,
  GymClasses.DAY_OFFSET.TOMORROW,
  GymClasses.DAY_OFFSET.DAY_AFTER_TOMORROW,
];

export const SCHEDULE_DAY_LABELS: Record<GymClasses.DAY_OFFSET, string> = {
  [GymClasses.DAY_OFFSET.TODAY]: "Today",
  [GymClasses.DAY_OFFSET.TOMORROW]: "Tomorrow",
  [GymClasses.DAY_OFFSET.DAY_AFTER_TOMORROW]: "Day after tomorrow",
};

export const HOME_COPY = {
  greeting: "Hi",
  signOut: "Sign out",
  loading: "Loading classes…",
  errorTitle: "We could not load the classes",
  errorBanner: "Showing the last saved schedule — the refresh failed.",
  retry: "Retry",
  emptySection: "No classes left for this day",
  reserve: "Reserve",
  full: "Full",
  spots: (available: number, total: number) => `${available} of ${total} spots`,
  duration: (minutes: number) => `${minutes} min`,
} as const;

export const BOOKING_COPY = {
  success: "Done! Your spot is booked.",
  failed: "We could not book your spot. Please try again.",
  noSpots: "This class is full.",
  alreadyBooked: "You already booked this class.",
  dailyLimit: "You can only book 2 classes per day.",
} as const;
