import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import AchievementsTab from "@/components/achievements/achievementTab";
import Header from "@/components/header/header";
import OverviewComp from "@/components/workout/overviewComp";
import PastWorkouts from "@/components/workout/pastWorkouts";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import { useQuery } from "@tanstack/react-query";
import { CompletedWorkout, OverviewStatsT } from "@/types";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const Tabs = ["Overview", "History", "Achievements"];
const TAB_WIDTH = width / Tabs.length;

const fetchUserOverview = async (userId: string): Promise<OverviewStatsT> => {
  const response = await fetch(`${API_URL}/api/overview/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user overview.");
  return response.json();
};

export default function SummaryScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const { userData } = useUserData();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
    }
  }, []);

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userOverview", userId],
    queryFn: () => fetchUserOverview(userId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!userData,
    refetchOnWindowFocus: false,
  });

  const fetchCompletedWorkouts = async (): Promise<CompletedWorkout[]> => {
    if (!userData) return [];
    const response = await fetch(
      `${API_URL}/api/completedWorkouts/getCompleted?userId=${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch completed workouts");
    return response.json();
  };

  const { data: completed = [] } = useQuery({
    queryKey: ["getCompleted"],
    queryFn: fetchCompletedWorkouts,
  });

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    // Animate indicator to the clicked tab
    Animated.timing(indicatorPosition, {
      toValue: index * TAB_WIDTH, // Move indicator to the new tab
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Summary" />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {Tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              Haptics.selectionAsync();
              handleTabPress(index);
            }}
            style={styles.tab}
          >
            <CustomText
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText,
              ]}
            >
              {tab}
            </CustomText>
          </TouchableOpacity>
        ))}

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        />
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 0 && stats && (
          <OverviewComp stats={stats} isLoading={isLoading} isError={isError} />
        )}
        {activeTab === 1 && <PastWorkouts completedWorkouts={completed} />}
        {activeTab === 2 && <AchievementsTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 10,
  },
  tab: {
    width: TAB_WIDTH, // Each tab takes equal width
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#aaa",
  },
  activeTabText: {
    fontFamily: "HostGrotesk-Medium",
    color: "#4F46E5",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: TAB_WIDTH, // Indicator width matches tab width
    backgroundColor: "#4F46E5",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  content: {
    padding: 20,
  },
});
