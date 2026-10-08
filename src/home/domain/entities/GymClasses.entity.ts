export namespace GymClasses {
  export enum DAY_OFFSET {
    TODAY = 0,
    TOMORROW = 1,
    DAY_AFTER_TOMORROW = 2,
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
  }
}
