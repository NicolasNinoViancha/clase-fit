import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/shared/components/themed-view";
import { MaxContentWidth, Spacing } from "@/shared/constants/theme";

import { HomeHeader } from "./components/homeHeader.component";
import { ScheduleError } from "./components/scheduleError.component";
import { ScheduleLoading } from "./components/scheduleLoading.component";
import { ScheduleSection } from "./components/scheduleSection.component";
import { useHomeViewModel } from "./hooks/home.viewModel.hook";

export default function HomeScreen() {
  const {
    user,
    sections,
    isLoading,
    isError,
    hasGymClasses,
    onSignOut,
    onRetry,
    onReserve,
  } = useHomeViewModel();

  const hasFailedWithNothingToShow = isError && !hasGymClasses;
  const hasData = !isLoading && !hasFailedWithNothingToShow;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <HomeHeader
          fullName={user.fullName}
          email={user.email}
          onSignOut={onSignOut}
        />

        {isLoading && <ScheduleLoading />}

        {hasFailedWithNothingToShow && (
          <ScheduleError variant="screen" onRetry={onRetry} />
        )}

        {hasData && (
          <ScrollView
            contentContainerStyle={styles.schedule}
            showsVerticalScrollIndicator={false}
          >
            {isError && <ScheduleError variant="banner" onRetry={onRetry} />}

            {sections.map((section) => (
              <ScheduleSection
                key={section.dayOffset}
                section={section}
                onReserve={onReserve}
              />
            ))}
          </ScrollView>
        )}
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
    gap: Spacing.four,
  },
  schedule: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
