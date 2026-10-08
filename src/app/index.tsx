import { Redirect } from "expo-router";

import { useSession } from "@/shared/hooks/useSession.hook";

export default function Index() {
  const session = useSession((state) => state.session);

  return <Redirect href={session ? "/home" : "/login"} />;
}
