import React, { useEffect } from "react";
import { FlatList, View, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import AchievementCard from "./achievementsCard";
import {
  ACHIEVEMENTS,
  AchievementItems,
  AchievementsTypeT,
  MILESTONES,
  STREAKS,
  trackAchievements,
} from "@/utils";
import CustomText from "../ui/customText";
import { useThemeColor } from "@/hooks/useThemeColor";

const AchievementsTab = () => {
  const textColor = useThemeColor({}, "text");
  const { userData } = useUserData();
  const userId = userData?.user_id ?? "";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats", userId],
    queryFn: () =>
      fetch(`${API_URL}/api/overview/${userId}`).then((res) => res.json()),
    enabled: !!userId,
  });

  const { data: unlockedAchievements = [], isLoading: achievementsLoading } =
    useQuery({
      queryKey: ["userAchievements", userId],
      queryFn: () =>
        fetch(`${API_URL}/api/achievements/${userId}`).then((res) =>
          res.json()
        ),
      enabled: !!userId,
    });

  useEffect(() => {
    if (stats) trackAchievements({ stats, userId });
  }, [stats, userId]);

  if (statsLoading || achievementsLoading) {
    return <ActivityIndicator size="large" />;
  }

  const renderAchievement = ({ item }: AchievementItems) => (
    <>
      <AchievementCard
        key={item.id}
        goal={item}
        unlocked={unlockedAchievements.includes(item.id)}
      />
    </>
  );

  const renderGrid = (data: AchievementsTypeT, title: string) => (
    <View style={{ gap: 5 }}>
      <CustomText style={[styles.header, { color: textColor }]}>
        {title}
      </CustomText>
      <FlatList
        data={data}
        scrollEnabled={false}
        renderItem={renderAchievement}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.achievementsContainer}>
        {renderGrid(ACHIEVEMENTS, "Achievements")}
        {renderGrid(MILESTONES, "Milestones")}
        {renderGrid(STREAKS, "Streaks")}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },
  header: {
    fontSize: 20,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 10,
  },
  gridContainer: {
    justifyContent: "space-between",
    gap: 15,
  },
  achievementsContainer: { display: "flex", gap: 30 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});

export default AchievementsTab;
