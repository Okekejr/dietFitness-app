import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/context/userContext";
import { UserDataProvider } from "@/context/userDataContext";
import { Linking } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a QueryClient instance
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();

  // Handle deep link events
  const handleDeepLink = (event: { url: string }) => {
    const parsedUrl = new URL(event.url);
    const path = parsedUrl.pathname.replace("/", "");
    const token = parsedUrl.searchParams.get("token");

    console.log("Deep link received:", event.url); // For debugging

    if (path === "resetPassword" && token) {
      router.replace(`/resetPassword?token=${token}`);
    }
  };

  useEffect(() => {
    // Listen for deep link events
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle the initial URL when the app is opened
    Linking.getInitialURL()
      .then((url) => {
        if (url) handleDeepLink({ url });
      })
      .catch((err) => console.error("Failed to get initial URL", err));

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <UserProvider>
          <UserDataProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="clubHome/[id]" />
            </Stack>
          </UserDataProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
