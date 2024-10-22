import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { getWorkoutPageIcons, getYouTubeVideoId, workoutInfoT } from "@/utils";
import LottieView from "lottie-react-native";
import { useUserData } from "@/context/userDataContext";
import { useQueryClient } from "@tanstack/react-query";

const { height } = Dimensions.get("window");

const WorkoutDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [workout, setWorkout] = useState<WorkoutsT | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const videoId = getYouTubeVideoId(workout ? workout?.video_url : "");
  const video = useRef<YoutubeIframeRef>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleCompleteWorkout = async () => {
    if (workout && userId) {
      console.log(workout.id, userId);

      try {
        const request = await fetch(`${API_URL}/api/completedWorkouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, workoutId: workout?.id }),
        });

        if (request.ok) {
          setIsCompleted(true);
          setModalVisible(true);
          queryClient.invalidateQueries({ queryKey: ["completedWorkouts"] });
        }
      } catch (error) {
        console.error("Error marking workout as completed", error);
      }
    }
  };

  const handleStateChange = (state: string) => {
    if (state === "ended") {
      handleCompleteWorkout();
    }
  };

  const closeModal = () => setModalVisible(false);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/workouts/${id}`);
        const data = await response.json();
        setWorkout(data);
        setIsFavorite(data.isFavorite);

        // Check if workout is completed
        const completedResponse = await fetch(
          `${API_URL}/api/completedWorkouts?userId=${userId}`
        );

        if (completedResponse.ok) {
          const completedData = await completedResponse.json();

          // Check if the workout ID is in the completed workouts
          const isWorkoutCompleted = completedData.some(
            (workout: WorkoutsT) => workout.id === data.id
          );
          setIsCompleted(isWorkoutCompleted);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching workout details:", error);
        setLoading(false);
      }
    };

    if (id && userData) {
      fetchWorkoutDetails();
      setUserId(userData.user_id);
    }
  }, [id]);

  const handleFavorite = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, workoutId: workout?.id, isFavorite }),
      });

      if (response.ok) {
        setIsFavorite((prev) => !prev);
      } else {
        console.error("Failed to update favorite status");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  const workoutIconsTexts = (
    workoutInfo: workoutInfoT,
    text: string | number
  ) => {
    return (
      <View style={styles.iconTextContainer}>
        <Ionicons
          name={getWorkoutPageIcons(workoutInfo)}
          size={24}
          color="black"
        />
        <Text style={styles.infoText}>
          {text === workoutInfo.duration &&
            `${workout.duration + " mins, " + workout.activity_level}`}
          {text === workoutInfo.tag && `${workout.tag + " workout"}`}
          {text === workout.intensity && `${workout.intensity + " intensity"}`}
          {text === workout.calories_burned &&
            `${workout.calories_burned + " calories burned"}`}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Workout Image with Back Button and Favorite Icon */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: workout.image_url, cache: "force-cache" }}
          style={styles.image}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push(`/category/${workout.category_id}`)}
        >
          <Ionicons name="chevron-back-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
        >
          <MaterialIcons
            name={isFavorite ? "bookmark" : "bookmark-outline"}
            size={28}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        {workoutIconsTexts({ duration: workout.duration }, workout.duration)}
        {workoutIconsTexts({ tag: workout.tag }, workout.tag)}
        {workoutIconsTexts({ intensity: workout.intensity }, workout.intensity)}
        {workoutIconsTexts(
          { calories_burned: workout.calories_burned },
          workout.calories_burned
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={24} color="green" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}

        <Text style={styles.description}>{workout.description}</Text>

        {videoId != "" && (
          <YoutubePlayer
            ref={video}
            height={300}
            videoId={videoId}
            onChangeState={handleStateChange}
          />
        )}

        {/* Completion Modal */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            {/* Lottie Animation */}
            <LottieView
              source={require("../../assets/try1.json")}
              autoPlay
              loop
              style={styles.animation}
            />

            <Text style={styles.modalText}>Workout Complete!</Text>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: height / 2.5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5,
  },
  favoriteButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5,
  },
  detailsContainer: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginVertical: 8,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#686D76",
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    marginVertical: 20,
    color: "#444",
  },
  video: {
    width: 320,
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  completedText: {
    marginLeft: 8,
    color: "green",
    fontWeight: "bold",
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "red",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5, // Add shadow on Android
    shadowColor: "#000", // Add shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  animation: {
    width: 200,
    height: 200,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff",
  },
});

export default WorkoutDetailsScreen;
