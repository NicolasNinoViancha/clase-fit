import { Redirect } from "expo-router";

import { useSession } from "@/shared/context/session-context";

export default function Index() {
  const { session } = useSession();

  return <Redirect href={session ? "/home" : "/login"} />;
}
