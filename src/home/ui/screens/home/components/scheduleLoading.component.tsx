import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Spacing } from "@/shared/constants/theme";
import { useTheme } from "@/shared/hooks/use-theme";

import { HOME_COPY } from "../home.constants";

export function ScheduleLoading() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator color={theme.tint} />
      <ThemedText type="small" themeColor="textSecondary">
        {HOME_COPY.loading}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
});
