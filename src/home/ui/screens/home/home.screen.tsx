import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
});
