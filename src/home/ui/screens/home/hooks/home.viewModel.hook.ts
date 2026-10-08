import { useSession } from "@/shared/hooks/useSession.hook";

import { HomeScreenModels } from "../home.models";

export function useHomeViewModel(): HomeScreenModels.ViewModel {
  const session = useSession((state) => state.session);
  const clearSession = useSession((state) => state.clearSession);

  return {
    user: session?.user ?? null,
    onSignOut: clearSession,
  };
}
