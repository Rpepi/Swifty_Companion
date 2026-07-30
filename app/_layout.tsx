import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useThemeColors, fonts } from "@/constants/styles";

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = useThemeColors();

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: fonts.mono, fontSize: 16 },
          headerShadowVisible: false,
        }}
      />
    </>
  );
}
