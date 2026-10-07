import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { Spacing } from "@/shared/constants/theme";
import { useTheme } from "@/shared/hooks/use-theme";

export type ThemedInputProps = TextInputProps & {
  label?: string;
  errorText?: string;
};

export function ThemedInput({
  label,
  errorText,
  style,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...rest
}: ThemedInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = errorText
    ? theme.danger
    : isFocused
      ? theme.tint
      : theme.border;

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}

      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />

      {errorText ? (
        <ThemedText type="small" themeColor="danger">
          {errorText}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    fontSize: 16,
    lineHeight: 24,
  },
});
