import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import SuperTokens from "supertokens-react-native";
import { getIconName, getTabTitle } from "@/utils";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import CustomText from "@/components/ui/customText";
import "../../config/supertokens";
import { useThemeColor } from "@/hooks/useThemeColor";

const { width: screenWidth } = Dimensions.get("window");

export default function Layout() {
  const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const tabBgColor = useThemeColor({}, "tabs");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isSessionActive = await SuperTokens.doesSessionExist();

        console.log(
          "User is authenticated:",
          await SuperTokens.doesSessionExist()
        );

        if (isSessionActive) {
          console.log("User is authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("No session, redirecting to login");
          router.replace({ pathname: "/login" });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        router.replace({ pathname: "/login" });
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={({
        route,
      }: {
        route: RouteProp<ParamListBase, string>;
      }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBarContainer, { backgroundColor: tabBgColor }],
        tabBarLabel: () => null,
        tabBarIcon: ({ focused, size }) => (
          <View style={[styles.tabContainer]}>
            <Ionicons
              name={getIconName(route.name, focused)}
              size={size}
              color="#fff"
            />
            <CustomText style={[styles.tabLabel, focused && { color: "#fff" }]}>
              {getTabTitle(route.name)}
            </CustomText>
          </View>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="workouts" options={{ title: "Workouts" }} />
      <Tabs.Screen name="summary" options={{ title: "Summary" }} />
      <Tabs.Screen name="runClub" options={{ title: "Run Club" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute", // Make the tab bar float
    bottom: 20,
    left: "5%",
    width: screenWidth * 0.9,
    paddingTop: 0,
    marginTop: 0,
    height: 75, // Set the height
    borderRadius: 75 / 2, // Half of height to make it fully rounded
    paddingHorizontal: 20, // Add padding inside the pill
    borderTopWidth: 0,
    borderTopColor: "none",
    zIndex: 10,
  },
  tabContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10,
    color: "#A0A0A0",
  },
});
