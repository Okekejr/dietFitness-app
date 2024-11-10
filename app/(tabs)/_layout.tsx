import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import SuperTokens from "supertokens-react-native";
import "../../config/supertokens";
import { getIconName, getTabTitle } from "@/utils";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import CustomText from "@/components/ui/customText";

export default function Layout() {
  const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

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
      initialRouteName="home"
      screenOptions={({
        route,
      }: {
        route: RouteProp<ParamListBase, string>;
      }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarLabel: ({ focused }) => (
          <CustomText style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
            {getTabTitle(route.name)}
          </CustomText>
        ),
        tabBarIcon: ({ focused, size }) => (
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName(route.name, focused)}
              size={size}
              color={focused ? "#080b18" : ""}
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
  iconContainer: {
    paddingTop: 8,
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
  tabLabelFocused: {
    color: "#080b18",
  },
});
