import { StyleSheet } from "react-native";

import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Spacing } from "@/shared/constants/theme";

import { HOME_COPY } from "../home.constants";

interface ScheduleErrorProps {
  onRetry: () => void;
  variant?: "screen" | "banner";
}

export function ScheduleError({
  onRetry,
  variant = "screen",
}: ScheduleErrorProps) {
  const isBanner = variant === "banner";

  return (
    <ThemedView
      type={isBanner ? "backgroundElement" : "background"}
      style={isBanner ? styles.banner : styles.screen}
    >
      <ThemedText
        type="small"
        themeColor={isBanner ? "textSecondary" : "danger"}
        style={isBanner ? styles.bannerText : undefined}
      >
        {isBanner ? HOME_COPY.errorBanner : HOME_COPY.errorTitle}
      </ThemedText>

      <ThemedButton
        variant="secondary"
        onPress={onRetry}
        style={isBanner ? styles.bannerAction : styles.screenAction}
      >
        {HOME_COPY.retry}
      </ThemedButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  screenAction: {
    alignSelf: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  bannerText: {
    flex: 1,
  },
  bannerAction: {
    alignSelf: "auto",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
