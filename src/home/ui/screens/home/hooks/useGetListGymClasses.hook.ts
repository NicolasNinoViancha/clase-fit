import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { homeServiceModule } from "@/home/ui/di/home.service.module";
import { useGymClasses } from "@/home/ui/hooks/useGymClasses.hook";

import { HOME_QUERY_KEYS } from "../home.constants";
import { isSameCalendarDay, selectUpcomingGymClasses } from "../home.utils";

export function useGetListGymClasses() {
  const storedGymClasses = useGymClasses((state) => state.gymClasses);
  const fetchedAt = useGymClasses((state) => state.fetchedAt);
  const setGymClasses = useGymClasses((state) => state.setGymClasses);

  const { isPending, isError, refetch } = useQuery({
    queryKey: [HOME_QUERY_KEYS.LIST_GYM_CLASSES],
    queryFn: async () => {
      const gymClasses =
        await homeServiceModule.queries.getListGymClasses.execute();

      setGymClasses(gymClasses);

      return gymClasses;
    },
  });

  const gymClasses = useMemo(
    () =>
      isSameCalendarDay(fetchedAt)
        ? selectUpcomingGymClasses(storedGymClasses)
        : [],
    [fetchedAt, storedGymClasses],
  );

  return {
    gymClasses,
    isLoading: isPending && gymClasses.length === 0,
    isError,
    refetch,
  };
}
