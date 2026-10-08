import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Spacing, type ThemeColor } from "@/shared/constants/theme";
import { useTheme } from "@/shared/hooks/use-theme";

export type ThemedBannerProps = {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
};

const ACCENT_BY_TYPE: Record<ThemedBannerProps["type"], ThemeColor> = {
  success: "success",
  error: "danger",
};

const DISMISS_LABEL = "✕";

export function ThemedBanner({ type, message, onDismiss }: ThemedBannerProps) {
  const theme = useTheme();
  const accent = ACCENT_BY_TYPE[type];

  return (
    <ThemedView
      type="backgroundElement"
      accessibilityRole="alert"
      style={[styles.banner, { borderLeftColor: theme[accent] }]}
    >
      <ThemedText type="small" themeColor={accent} style={styles.message}>
        {message}
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        hitSlop={Spacing.two}
        onPress={onDismiss}
      >
        <ThemedText type="smallBold" themeColor="textSecondary">
          {DISMISS_LABEL}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderLeftWidth: 3,
  },
  message: {
    flex: 1,
  },
});
