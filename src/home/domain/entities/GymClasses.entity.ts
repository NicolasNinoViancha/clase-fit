export namespace GymClasses {
  export enum DAY_OFFSET {
    TODAY = 0,
    TOMORROW = 1,
    DAY_AFTER_TOMORROW = 2,
  }

  export enum BOOKING_ERROR {
    ALREADY_BOOKED = "ALREADY_BOOKED",
    NO_SPOTS = "NO_SPOTS",
    DAILY_LIMIT = "DAILY_LIMIT",
  }

  export interface Entity {
    id: string;
    name: string;
    instructor: string;
    dayOffset: number;
    hour: string;
    duration: number;
    totalCapacity: number;
    occupied: number;
    isFull: boolean;
    bookedUserIds: string[];
  }
}
