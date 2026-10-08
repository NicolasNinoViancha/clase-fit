import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { Spacing } from "@/shared/constants/theme";

import { HomeScreenModels } from "../home.models";
import { GymClassCard } from "./gymClassCard.component";
import { SectionEmpty } from "./sectionEmpty.component";

interface ScheduleSectionProps {
  section: HomeScreenModels.Section;
  onReserve: () => void;
}

export function ScheduleSection({ section, onReserve }: ScheduleSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <ThemedText type="smallBold">{section.label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {section.date}
        </ThemedText>
      </View>

      {section.gymClasses.length === 0 ? (
        <SectionEmpty />
      ) : (
        section.gymClasses.map((gymClass) => (
          <GymClassCard
            key={gymClass.id}
            gymClass={gymClass}
            dayLabel={section.label}
            onReserve={onReserve}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  heading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
});
