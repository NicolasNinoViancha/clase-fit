import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type { Session } from "@/shared/types/auth";

/**
 * TODO: validación quemada temporal. Esta es la única pieza que se reemplaza
 * cuando entre el store persistido (Zustand + MMKV/expo-secure-store): la firma
 * del hook y el tipo `Session` se mantienen para que las pantallas no cambien.
 */
const DEMO_CREDENTIALS = {
  email: "admin@clasefit.com",
  password: "clasefit123",
};

const DEMO_SESSION: Session = {
  user: {
    token: "demo-token",
    id: "1",
    email: DEMO_CREDENTIALS.email,
    fullName: "Admin Clase Fit",
  },
};

type SessionContextValue = {
  session: Session | null;
  isLoading: boolean;
  /** Devuelve `false` cuando las credenciales no son válidas. */
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);

  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  const signIn = useCallback((email: string, password: string) => {
    const isValid =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;

    if (!isValid) return false;

    setSession(DEMO_SESSION);
    return true;
  }, []);

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, isLoading: false, signIn, signOut }),
    [session, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export { DEMO_CREDENTIALS };
