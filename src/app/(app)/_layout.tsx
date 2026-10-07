import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "home",
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Inicio" }} />
    </Stack>
  );
}
