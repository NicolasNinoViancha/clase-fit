import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ENV_API_URL, IS_DEV_MODE } from "@/core/config/env.constants";
import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { MaxContentWidth, Spacing } from "@/shared/constants/theme";

import { useHomeViewModel } from "./hooks/home.viewModel.hook";

export default function HomeScreen() {
  const { user, onSignOut } = useHomeViewModel();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle">Hola, {user.fullName}</ThemedText>
          <ThemedText themeColor="textSecondary">{user.email}</ThemedText>

          {/*@toDo: temporary block to verify the env variables reach the bundle — remove it */}
          <ThemedView style={styles.env}>
            <ThemedText type="smallBold">env</ThemedText>
            <ThemedText type="code" themeColor="textSecondary">
              ENV_API_URL = {JSON.stringify(ENV_API_URL)}
            </ThemedText>
            <ThemedText type="code" themeColor="textSecondary">
              IS_DEV_MODE = {JSON.stringify(IS_DEV_MODE)} ({typeof IS_DEV_MODE})
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedButton variant="secondary" onPress={onSignOut}>
          Cerrar sesión
        </ThemedButton>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth / 2,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    justifyContent: "space-between",
  },
  content: {
    gap: Spacing.one,
  },
  env: {
    marginTop: Spacing.four,
    gap: Spacing.one,
  },
});
