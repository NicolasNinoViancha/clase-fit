import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { MaxContentWidth, Spacing } from "@/shared/constants/theme";
import { useSession } from "@/shared/context/session-context";

export default function HomeScreen() {
  const { session, signOut } = useSession();

  // El guard del root ya garantiza que hay sesión; esto mantiene el strict null check.
  if (!session) return null;

  const { fullName, email } = session.user;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle">Hola, {fullName}</ThemedText>
          <ThemedText themeColor="textSecondary">{email}</ThemedText>
        </ThemedView>
        <ThemedButton variant="secondary" onPress={signOut}>
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
