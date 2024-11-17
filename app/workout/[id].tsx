import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { getWorkoutPageIcons, getYouTubeVideoId, workoutInfoT } from "@/utils";
import LottieView from "lottie-react-native";
import { useUserData } from "@/context/userDataContext";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from "@/components/ui/backButton";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";

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
          queryClient.invalidateQueries({
            queryKey: ["completedWorkouts"],
          });
          queryClient.invalidateQueries({ queryKey: ["userOverview", userId] });
          queryClient.invalidateQueries({ queryKey: ["getCompleted"] });
          queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
          queryClient.invalidateQueries({ queryKey: ["favoritedWorkouts"] });
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

  const fetchWorkoutDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`);
      const data = await response.json();
      setWorkout(data);

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

  useEffect(() => {
    if (id && userData) {
      fetchWorkoutDetails();
      setUserId(userData.user_id);
    }
  }, [id]);

  useEffect(() => {
    if (userId && workout) {
      fetchFavoritesStatus();
    }
  }, [workout]);

  const fetchFavoritesStatus = async () => {
    if (userId && workout) {
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

  const handleFavorite = async () => {
    if (!workout) {
      return;
    }

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
        <CustomText style={styles.errorText}>Workout not found</CustomText>
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
        <CustomText style={styles.infoText}>
          {text === workoutInfo.duration &&
            `${workout.duration + " mins, " + workout.activity_level}`}
          {text === workoutInfo.tag && `${workout.tag + " workout"}`}
          {text === workout.intensity && `${workout.intensity + " intensity"}`}
          {text === workout.calories_burned &&
            `${workout.calories_burned + " calories burned"}`}
        </CustomText>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Workout Image with Back Button and Favorite Icon */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: workout.image_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          placeholder={require("../../assets/img/avatar-placeholder.png")}
        />
        <BackButton />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleFavorite();
          }}
        >
          <MaterialIcons
            name={isFavorite ? "bookmark" : "bookmark-outline"}
            size={28}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <CustomText style={styles.workoutName}>{workout.name}</CustomText>
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
            <CustomText style={styles.completedText}>Completed</CustomText>
          </View>
        )}

        <CustomText style={styles.description}>
          {workout.description}
        </CustomText>

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

            <CustomText style={styles.modalText}>Workout Complete!</CustomText>
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
    fontFamily: "HostGrotesk-Medium",
    color: "#333",
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
    fontFamily: "HostGrotesk-Medium",
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
    fontFamily: "HostGrotesk-Medium",
  },
  animation: {
    width: 200,
    height: 200,
  },
  modalText: {
    fontSize: 20,
    fontFamily: "HostGrotesk-Medium",
    marginTop: 10,
    color: "#fff",
  },
});

export default WorkoutDetailsScreen;
