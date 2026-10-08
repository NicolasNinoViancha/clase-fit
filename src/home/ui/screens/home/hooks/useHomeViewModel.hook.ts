import { useCallback, useMemo } from "react";

import { useSession } from "@/shared/hooks/useSession.hook";

import {
  BOOKING_COPY,
  SCHEDULE_DAY_LABELS,
  SCHEDULE_DAY_OFFSETS,
} from "../home.constants";
import { HomeScreenModels } from "../home.models";
import { getSectionDate, resolveBookingMessage } from "../home.utils";
import { useBanner } from "./useBanner.hook";
import { useBookGymClass } from "./useBookGymClass.hook";
import { useGetListGymClasses } from "./useGetListGymClasses.hook";

export function useHomeViewModel(): HomeScreenModels.ViewModel {
  const user = useSession((state) => state.session.user);
  const clearSession = useSession((state) => state.clearSession);

  const { gymClasses, isLoading, isError, refetch } = useGetListGymClasses();
  const { bookGymClass, bookingGymClassId } = useBookGymClass();
  const { banner, setBanner } = useBanner();

  const sections = useMemo<HomeScreenModels.Section[]>(
    () =>
      SCHEDULE_DAY_OFFSETS.map((dayOffset) => ({
        dayOffset,
        label: SCHEDULE_DAY_LABELS[dayOffset],
        date: getSectionDate(dayOffset),
        gymClasses: gymClasses.filter(
          (gymClass) => gymClass.dayOffset === dayOffset,
        ),
      })),
    [gymClasses],
  );

  const onReserve = useCallback(
    async (gymClassId: string) => {
      try {
        const isBooked = await bookGymClass({ gymClassId, userId: user.id });

        setBanner(
          isBooked
            ? { type: "success", message: BOOKING_COPY.success }
            : { type: "error", message: BOOKING_COPY.failed },
        );
      } catch (error) {
        setBanner({ type: "error", message: resolveBookingMessage(error) });
      }
    },
    [bookGymClass, setBanner, user.id],
  );

  const onDismissBanner = useCallback(() => setBanner(null), [setBanner]);

  return {
    user,
    sections,
    banner,
    bookingGymClassId,
    isLoading,
    isError,
    hasGymClasses: gymClasses.length > 0,
    onSignOut: clearSession,
    onRetry: refetch,
    onReserve,
    onDismissBanner,
  };
}
