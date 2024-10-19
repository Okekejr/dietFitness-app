import React, { FC, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import { Href, useRouter } from "expo-router";

interface WorkoutCardProps {
  workout: WorkoutsT;
  userId: string;
}

const WorkoutCard: FC<WorkoutCardProps> = ({ workout, userId }) => {
  const [isFavorite, setIsFavorite] = useState(workout.isFavorite);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // // Fetch the completed status of the workout
  // useEffect(() => {
  //   const fetchCompletedStatus = async () => {
  //     try {
  //       const response = await fetch(
  //         `${API_URL}/api/completedWorkouts?userId=${userId}`
  //       );
  //       if (!response.ok) {
  //         console.error("Failed to fetch completed workouts:", response.status);
  //         return;
  //       }

  //       const completedWorkouts = await response.json();

  //       // Check if the response is an array
  //       if (Array.isArray(completedWorkouts)) {
  //         setIsCompleted(completedWorkouts.includes(workout.id));
  //       } else {
  //         console.warn("Unexpected response format:", completedWorkouts);
  //         setIsCompleted(false);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch completed status:", error);
  //     }
  //   };

  //   fetchCompletedStatus();
  // }, [workout.id, userId]);

  const handleFavorite = async () => {
    setLoading(true);
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
    paddingHorizontal: 16,
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
    marginTop: 8,
  },
});

export default WorkoutCard;
