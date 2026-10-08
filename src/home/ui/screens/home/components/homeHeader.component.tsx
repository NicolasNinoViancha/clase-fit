import { StyleSheet } from "react-native";

import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Spacing } from "@/shared/constants/theme";

import { HOME_COPY } from "../home.constants";

interface HomeHeaderProps {
  fullName: string;
  email: string;
  onSignOut: () => void;
}

export function HomeHeader({ fullName, email, onSignOut }: HomeHeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.identity}>
        <ThemedText type="default">
          {HOME_COPY.greeting}, {fullName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {email}
        </ThemedText>
      </ThemedView>

      <ThemedButton
        variant="secondary"
        onPress={onSignOut}
        style={styles.action}
      >
        {HOME_COPY.signOut}
      </ThemedButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  identity: {
    flex: 1,
  },
  action: {
    alignSelf: "auto",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
