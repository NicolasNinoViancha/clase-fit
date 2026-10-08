import { useSession } from "@/shared/hooks/useSession.hook";

import { HomeScreenModels } from "../home.models";

export function useHomeViewModel(): HomeScreenModels.ViewModel {
  const user = useSession((state) => state.session.user);
  const clearSession = useSession((state) => state.clearSession);

  return {
    user,
    onSignOut: clearSession,
  };
}
