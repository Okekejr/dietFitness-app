import React, { FC, useEffect, useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import CustomText from "../ui/customText";

interface WorkoutCardProps {
  workout: WorkoutsT;
  userId: string;
}

const WorkoutCard: FC<WorkoutCardProps> = ({ workout, userId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const router = useRouter();

  const fetchCompletedStatus = async () => {
    if (userId) {
      try {
        const response = await fetch(
          `${API_URL}/api/completedWorkouts?userId=${userId}`
        );

        if (response.ok) {
          const completedWorkouts = await response.json();

          // Check if the workout ID is in the completed workouts
          const isWorkoutCompleted = completedWorkouts.some(
            (work: WorkoutsT) => work.id === workout.id
          );
          setIsCompleted(isWorkoutCompleted);
        }
      } catch (error) {
        console.error("Failed to fetch completed status:", error);
      }
    }
  };

  const fetchFavoritesStatus = async () => {
    if (userId) {
      try {
        const response = await fetch(
          `${API_URL}/api/favorites?userId=${userId}`
        );

        if (response.ok) {
          const favoritedWorkouts = await response.json();

          // Check if the workout ID is in the favorited workouts
          const isworkoutFavorited = favoritedWorkouts.some(
            (work: WorkoutsT) => work.id === workout.id
          );
          setIsFavorite(isworkoutFavorited);
        }
      } catch (error) {
        console.error("Failed to fetch completed status:", error);
      }
    }
  };

  // Fetch the completed status of the workout
  useEffect(() => {
    fetchCompletedStatus();
    fetchFavoritesStatus();
  }, [workout.id, userId, isFavorite]);

  const handleFavorite = async () => {
    setLoading(true);

    console.log(userId, workout.id, isFavorite);
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutId: workout.id,
          isFavorite,
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        // Invalidate relevant queries to refetch and update UI
        queryClient.invalidateQueries({ queryKey: ["favoritedWorkouts"] });
        queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
      } else {
        console.error(
          "Failed to update favorite status:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    router.push({
      pathname: `/workout/[id]`,
      params: { id: workout.id },
    });
  };

  return (
    <TouchableOpacity style={styles.workoutCard} onPress={handleNavigate}>
      <Image
        source={{ uri: workout.image_url, cache: "force-cache" }}
        style={styles.workoutImage}
      />
      <View style={styles.workoutInfo}>
        <CustomText style={styles.workoutName}>{workout.name}</CustomText>
        <View style={styles.innerInfo}>
          <CustomText style={styles.infoText}>{workout.tag} •</CustomText>
          <CustomText style={styles.infoText}>
            {workout.duration} mins •
          </CustomText>
          <CustomText style={styles.infoText}>
            {workout.activity_level} •
          </CustomText>
          <CustomText style={styles.infoText}>{workout.intensity}</CustomText>
        </View>

        {isCompleted && (
          <View style={styles.completedContainer}>
            <MaterialIcons name="check-circle" size={20} color="green" />
          </View>
        )}
      </View>
      <TouchableOpacity onPress={handleFavorite} disabled={loading}>
        <Ionicons
          name={isFavorite ? "bookmark" : "bookmark-outline"}
          size={20}
          color={loading ? "#31363F" : "black"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 10,
    marginBottom: 20,
  },
  workoutImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 15,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 4,
  },
  infoText: {
    color: "#686D76",
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  innerInfo: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: 220,
    gap: 4,
  },
});

export default WorkoutCard;
