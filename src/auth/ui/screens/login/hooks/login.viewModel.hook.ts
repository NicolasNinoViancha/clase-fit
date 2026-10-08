import { useState } from "react";

import { useSession } from "@/shared/hooks/useSession.hook";

import { DEMO_CREDENTIALS, DEMO_SESSION } from "../login.constants";
import { LoginScreenModels } from "../login.models";

export function useLoginViewModel(): LoginScreenModels.ViewModel {
  const setSession = useSession((state) => state.setSession);
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);

  function onChangeEmail(value: string) {
    setEmail(value);
    setError(null);
  }

  function onChangePassword(value: string) {
    setPassword(value);
    setError(null);
  }

  function onSubmit() {
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    const isValid =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;

    if (!isValid) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    setError(null);
    setSession(DEMO_SESSION);
  }

  return {
    email,
    password,
    error,
    onChangeEmail,
    onChangePassword,
    onSubmit,
  };
}
