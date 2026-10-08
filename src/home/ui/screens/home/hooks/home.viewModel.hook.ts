import { useCallback, useMemo } from "react";

import { useSession } from "@/shared/hooks/useSession.hook";

import { SCHEDULE_DAY_LABELS, SCHEDULE_DAY_OFFSETS } from "../home.constants";
import { HomeScreenModels } from "../home.models";
import { getSectionDate } from "../home.utils";
import { useGetListGymClasses } from "./getListGymClasses.hook";

export function useHomeViewModel(): HomeScreenModels.ViewModel {
  const user = useSession((state) => state.session.user);
  const clearSession = useSession((state) => state.clearSession);

  const { gymClasses, isLoading, isError, refetch } = useGetListGymClasses();

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

  const onReserve = useCallback(() => {
    //@toDo: reserve the class through a write use case; reserving is its own user story
  }, []);

  return {
    user,
    sections,
    isLoading,
    isError,
    hasGymClasses: gymClasses.length > 0,
    onSignOut: clearSession,
    onRetry: refetch,
    onReserve,
  };
}
