import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import SuperTokens from "supertokens-react-native";
import { getIconName, getTabTitle } from "@/utils";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import CustomText from "@/components/ui/customText";
import "../../config/supertokens";
import { useThemeColor } from "@/hooks/useThemeColor";

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
        tabBarStyle: { backgroundColor: tabBgColor, height: 95 },
        tabBarLabel: ({ focused }) => (
          <CustomText style={[styles.tabLabel, focused && { color: "#fff" }]}>
            {getTabTitle(route.name)}
          </CustomText>
        ),
        tabBarIcon: ({ focused, size }) => (
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName(route.name, focused)}
              size={24}
              color="#fff"
            />
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
  tabLabel: {
    fontSize: 10,
    color: "#A0A0A0",
    marginTop: 5,
  },
  iconContainer: {
    marginTop: 15,
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabelFocused: {
    color: "#080b18",
  },
});
