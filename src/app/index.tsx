import { Redirect } from "expo-router";

import { useSession } from "@/shared/hooks/useSession.hook";

export default function Index() {
  const isAuth = useSession((state) => state.session.isAuth);

  return <Redirect href={isAuth ? "/home" : "/login"} />;
}
