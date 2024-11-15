import React, { FC } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { CompletedWorkout } from "@/types";
import Divider from "../ui/divider";
import CustomText from "../ui/customText";

interface PastWorkoutsProps {
  completedWorkouts: CompletedWorkout[];
}

const PastWorkouts: FC<PastWorkoutsProps> = ({ completedWorkouts }) => {
  const router = useRouter();

  if (completedWorkouts.length === 0) {
    return (
      <View>
        <CustomText style={styles.description}>
          You havent completed any workouts yet.
        </CustomText>
      </View>
    );
  }

  // Group workouts by month and year
  const groupedWorkouts = completedWorkouts.reduce((acc, workout) => {
    const date = new Date(workout.completed_at);
    const monthYear = format(date, "MMMM yyyy");

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(workout);
    return acc;
  }, {} as Record<string, CompletedWorkout[]>);

  // Render each workout item
  const renderWorkout = ({ item }: { item: CompletedWorkout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() =>
        router.push({
          pathname: `/workout/[id]`,
          params: { id: item.id },
        })
      }
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.workoutImage}
        contentFit="cover"
        cachePolicy="disk"
        placeholder={require("../../assets/img/avatar-placeholder.png")}
      />
      <View style={styles.workoutInfo}>
        {item.name && (
          <CustomText style={styles.workoutName}>{item.name}</CustomText>
        )}
        <View style={styles.innerInfo}>
          <CustomText style={styles.infoText}>{item.tag} •</CustomText>
          <CustomText style={styles.infoText}>
            {item.duration} mins •
          </CustomText>
          {item.activity_level && (
            <CustomText style={styles.infoText}>
              {item.activity_level} •
            </CustomText>
          )}
          {item.intensity && (
            <CustomText style={styles.infoText}>{item.intensity}</CustomText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render the section for each month
  const renderMonthSection = ([monthYear, workouts]: [
    string,
    CompletedWorkout[]
  ]) => (
    <View key={monthYear} style={styles.monthSection}>
      <View style={styles.monthHeader}>
        <CustomText style={styles.monthTitle}>{monthYear}</CustomText>
        <CustomText style={styles.monthSummary}>
          {workouts.length} {workouts.length === 1 ? "Workout" : "Workouts"} •{" "}
          {workouts.reduce((total, w) => total + w.duration, 0)} Minutes
        </CustomText>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => `${item.id}-${item.completed_at}`}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />

      <Divider />
    </View>
  );

  return (
    <FlatList
      data={Object.entries(groupedWorkouts)}
      scrollEnabled={false}
      renderItem={({ item }) => renderMonthSection(item)}
      keyExtractor={(item) => item[0]}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <CustomText style={styles.emptyMessage}>
          No workouts completed yet.
        </CustomText>
      }
    />
  );
};

export default PastWorkouts;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  monthSection: {
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
    color: "#4F46E5",
  },
  monthSummary: {
    color: "#686D76",
  },
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
  },
  workoutImage: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: "#686D76",
    marginBottom: 3,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  innerInfo: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: 220,
    gap: 4,
  },
});
