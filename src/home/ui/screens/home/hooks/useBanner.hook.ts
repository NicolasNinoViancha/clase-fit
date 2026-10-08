import { useEffect, useState } from "react";

import { BOOKING_BANNER_DURATION } from "../home.constants";
import { HomeScreenModels } from "../home.models";

export function useBanner() {
  const [banner, setBanner] = useState<HomeScreenModels.Banner | null>(null);

  useEffect(() => {
    if (!banner) {
      return;
    }

    const timer = setTimeout(() => setBanner(null), BOOKING_BANNER_DURATION);

    return () => clearTimeout(timer);
  }, [banner]);

  return { banner, setBanner };
}
