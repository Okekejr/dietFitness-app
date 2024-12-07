import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/context/userContext";
import { UserDataProvider } from "@/context/userDataContext";
import { Linking } from "react-native";
import { ThemeProvider } from "@/context/userThemeContext";
import CustomWrapper from "@/components/customWrapper";
import { NavigationContainer } from "@react-navigation/native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a QueryClient instance
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "HostGrotesk-Light": require("../assets/fonts/HostGrotesk-Light.ttf"),
    "HostGrotesk-LightItalic": require("../assets/fonts/HostGrotesk-LightItalic.ttf"),
    "HostGrotesk-Medium": require("../assets/fonts/HostGrotesk-Medium.ttf"),
    "HostGrotesk-Regular": require("../assets/fonts/HostGrotesk-Regular.ttf"),
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
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <UserDataProvider>
              <CustomWrapper>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </CustomWrapper>
            </UserDataProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
}
