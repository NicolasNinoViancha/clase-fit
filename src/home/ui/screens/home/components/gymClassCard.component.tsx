import { StyleSheet, View } from "react-native";

import type { GymClasses } from "@/home/domain/entities/GymClasses.entity";
import { ThemedButton } from "@/shared/components/themed-button";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Spacing } from "@/shared/constants/theme";

import { HOME_COPY } from "../home.constants";

interface GymClassCardProps {
  gymClass: GymClasses.Entity;
  dayLabel: string;
  onReserve: () => void;
}

export function GymClassCard({
  gymClass,
  dayLabel,
  onReserve,
}: GymClassCardProps) {
  const availableSpots = gymClass.totalCapacity - gymClass.occupied;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="default">{gymClass.name}</ThemedText>

        {gymClass.isFull ? (
          <ThemedView type="backgroundSelected" style={styles.badge}>
            <ThemedText type="smallBold" themeColor="danger">
              {HOME_COPY.full}
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedText type="smallBold" themeColor="textSecondary">
            {HOME_COPY.spots(availableSpots, gymClass.totalCapacity)}
          </ThemedText>
        )}
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {dayLabel} · {gymClass.hour} · {HOME_COPY.duration(gymClass.duration)}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary">
        {gymClass.instructor}
      </ThemedText>

      <ThemedButton
        disabled={gymClass.isFull}
        onPress={onReserve}
        style={styles.action}
      >
        {HOME_COPY.reserve}
      </ThemedButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  action: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
  },
});
