import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import type { HomeRepositoryModels } from "@/home/domain/repositories/home.repository.models";
import { homeServiceModule } from "@/home/ui/di/home.service.module";
import { useGymClasses } from "@/home/ui/hooks/useGymClasses.hook";

import { HOME_MUTATION_KEYS } from "../home.constants";

export function useBookGymClass() {
  const gymClasses = useGymClasses((state) => state.gymClasses);
  const bookGymClassInStore = useGymClasses((state) => state.bookGymClass);

  const [pendingGymClassId, setPendingGymClassId] = useState<string | null>(
    null,
  );

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [HOME_MUTATION_KEYS.BOOK_GYM_CLASS],
    mutationFn: (params: HomeRepositoryModels.ParamsWriteBookGymClass) =>
      homeServiceModule.write.bookGymClass.execute({ ...params, gymClasses }),
    onMutate: ({ gymClassId }) => setPendingGymClassId(gymClassId),
    onSuccess: (isBooked, { gymClassId, userId }) => {
      if (!isBooked) {
        return;
      }
      bookGymClassInStore({ gymClassId, userId });
      setPendingGymClassId(null);
    },
  });

  return {
    bookGymClass: mutateAsync,
    bookingGymClassId: isPending ? pendingGymClassId : null,
  };
}
