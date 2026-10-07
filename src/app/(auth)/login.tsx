import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedInput } from "@/shared/components/themed-input";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { MaxContentWidth, Spacing } from "@/shared/constants/theme";
import { DEMO_CREDENTIALS, useSession } from "@/shared/context/session-context";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    // No navegamos a mano: al cambiar la sesión los guards montan `(app)`.
    if (!signIn(email, password)) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    setError(null);
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Clase Fit</ThemedText>
            <ThemedText themeColor="textSecondary">
              Inicia sesión para continuar
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            <ThemedInput
              label="Correo"
              placeholder="tucorreo@clasefit.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <ThemedInput
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              errorText={error ?? undefined}
            />

            <ThemedButton onPress={handleSubmit}>Iniciar sesión</ThemedButton>
          </ThemedView>

          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.hint}
          >
            Demo: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
          </ThemedText>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth / 2,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  hint: {
    textAlign: "center",
  },
});
