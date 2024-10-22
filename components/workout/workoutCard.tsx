import React, { FC, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

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
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.infoText}>Duration: {workout.duration} mins</Text>
        <Text style={styles.infoText}>
          Activity Level: {workout.activity_level}
        </Text>
        <Text style={styles.infoText}>Intensity: {workout.intensity}</Text>

        {isCompleted && (
          <View style={styles.completedContainer}>
            <MaterialIcons name="check-circle" size={20} color="green" />
          </View>
        )}
      </View>
      <TouchableOpacity onPress={handleFavorite} disabled={loading}>
        <MaterialIcons
          name={isFavorite ? "bookmark" : "bookmark-outline"}
          size={24}
          color={loading ? "gray" : "black"}
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
    fontWeight: "bold",
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
});

export default WorkoutCard;
