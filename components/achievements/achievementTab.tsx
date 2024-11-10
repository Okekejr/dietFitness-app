import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import AchievementCard from "./achievementsCard";
import { Goal, OverviewStatsT } from "@/types";
import { ACHIEVEMENTS, MILESTONES, trackAchievements } from "@/utils";
import CustomText from "../ui/customText";

const fetchUserOverview = async (userId: string): Promise<OverviewStatsT> => {
  const response = await fetch(`${API_URL}/api/overview/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user overview.");
  }
  return response.json();
};

const fetchUnlockedAchievements = async (userId: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/achievements/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch unlocked achievements.");
  }
  return response.json();
};

const AchievementsTab = () => {
  const { userData } = useUserData();
  const userId = userData?.user_id ?? "";

  const {
    data: stats,
    isLoading: statsLoading,
    isSuccess: statsSuccess,
  } = useQuery({
    queryKey: ["userStats", userId],
    queryFn: () => fetchUserOverview(userId),
    enabled: !!userId,
  });

  // Fetch unlocked achievements
  const { data: unlockedAchievements = [], isLoading: achievementsLoading } =
    useQuery({
      queryKey: ["userAchievements", userId],
      queryFn: () => fetchUnlockedAchievements(userId),
      enabled: !!userId,
    });

  useEffect(() => {
    if (statsSuccess) {
      trackAchievements({ stats, userId });
    }
  }, [statsSuccess, stats, userId]);

  if (statsLoading || achievementsLoading) {
    return <ActivityIndicator size="large" />;
  }

  const renderAchievements = (goals: Goal[]) =>
    goals.map((goal) => (
      <AchievementCard
        key={goal.id}
        goal={goal}
        unlocked={unlockedAchievements.includes(goal.id)}
      />
    ));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {stats?.totalWorkouts === 0 ? (
        <View style={styles.center}>
          <CustomText style={styles.description}>
            You haven't completed any workouts yet.
          </CustomText>
        </View>
      ) : (
        <>
          <CustomText style={styles.header}>Achievements</CustomText>
          <View style={styles.section}>{renderAchievements(ACHIEVEMENTS)}</View>
          <CustomText style={styles.header}>Milestones</CustomText>
          <View style={styles.section}>{renderAchievements(MILESTONES)}</View>
        </>
      )}

      {/* <Text style={styles.header}>Streaks</Text>
      <View style={styles.section}>{renderAchievements(STREAKs)}</View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  header: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});

export default AchievementsTab;
