
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import Constants from "expo-constants";

// Log backend URL for debugging
console.log('[App] Backend URL:', Constants.expoConfig?.extra?.backendUrl);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "onboarding",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(96, 165, 250)", // Light blue - #60A5FA
      background: "rgb(15, 23, 42)", // Dark background - #0F172A
      card: "rgb(30, 41, 59)", // Card background - #1E293B
      text: "rgb(241, 245, 249)", // Light text - #F1F5F9
      border: "rgb(51, 65, 85)", // Border - #334155
      notification: "rgb(96, 165, 250)", // Light blue - #60A5FA
    },
  };

  return (
    <>
      <StatusBar style="light" animated />
      <ThemeProvider value={CustomDarkTheme}>
        <AuthProvider>
          <GestureHandlerRootView>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="auth-popup" />
              <Stack.Screen name="auth-callback" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="exam/[id]"
                options={{
                  headerShown: true,
                  title: "Exam Details",
                  headerStyle: { backgroundColor: '#0F172A' },
                  headerTintColor: '#60A5FA',
                }}
              />
              <Stack.Screen
                name="add-exam"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Add Exam",
                  headerStyle: { backgroundColor: '#0F172A' },
                  headerTintColor: '#60A5FA',
                }}
              />
              <Stack.Screen
                name="edit-exam/[id]"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Edit Exam",
                  headerStyle: { backgroundColor: '#0F172A' },
                  headerTintColor: '#60A5FA',
                }}
              />
              <Stack.Screen
                name="paywall"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Upgrade to Pro",
                  headerStyle: { backgroundColor: '#0F172A' },
                  headerTintColor: '#60A5FA',
                }}
              />
            </Stack>
            <SystemBars style="light" />
          </GestureHandlerRootView>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
