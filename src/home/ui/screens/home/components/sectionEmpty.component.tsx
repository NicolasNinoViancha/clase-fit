import { StyleSheet } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Spacing } from "@/shared/constants/theme";

import { HOME_COPY } from "../home.constants";

export function SectionEmpty() {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {HOME_COPY.emptySection}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
});
