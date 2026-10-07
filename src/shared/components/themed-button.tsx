import { type ReactNode } from "react";
import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { Spacing } from "@/shared/constants/theme";
import { useTheme } from "@/shared/hooks/use-theme";

export type ThemedButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function ThemedButton({
  children,
  onPress,
  variant = "primary",
  disabled,
  style,
  ...rest
}: ThemedButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === "primary" ? theme.tint : theme.backgroundElement;
  const textColor = variant === "primary" ? theme.tintText : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={(state) => [
        styles.button,
        { backgroundColor },
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {typeof children === "string" ? (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {children}
        </ThemedText>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
