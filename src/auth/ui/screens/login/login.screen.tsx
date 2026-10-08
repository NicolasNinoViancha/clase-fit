import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedInput } from "@/shared/components/themed-input";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { MaxContentWidth, Spacing } from "@/shared/constants/theme";

import { useLoginViewModel } from "./hooks/login.viewModel.hook";
import { DEMO_CREDENTIALS } from "./login.constants";

export default function LoginScreen() {
  const {
    email,
    password,
    error,
    onChangeEmail,
    onChangePassword,
    onSubmit,
  } = useLoginViewModel();

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
              onChangeText={onChangeEmail}
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
              onChangeText={onChangePassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              errorText={error ?? undefined}
            />

            <ThemedButton onPress={onSubmit}>Iniciar sesión</ThemedButton>
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
