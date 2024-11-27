import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import { getWorkoutPageIcons, workoutInfoT } from "@/utils";
import LottieView from "lottie-react-native";
import { useUserData } from "@/context/userDataContext";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from "@/components/ui/backButton";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResizeMode, Video, AVPlaybackStatus } from "expo-av";

const { height, width } = Dimensions.get("window");

const videoSource = {
  uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

const WorkoutDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const queryClient = useQueryClient();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const subTextColor = useThemeColor({}, "subText");
  const iconTextColor = useThemeColor({}, "icon");
  const [workout, setWorkout] = useState<WorkoutsT | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef<Video | null>(null);
  const [is60SecondsCalled, setIs60SecondsCalled] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleEnterFullscreen = async () => {
    try {
      setVideoVisible(true);

      // Wait for the video to be fully loaded and start fullscreen
      if (videoRef.current) {
        await videoRef.current.presentFullscreenPlayer();
      }
    } catch (error) {
      Alert.alert("Fullscreen Error");
    }
  };

  // Handle video playback status updates
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if ("positionMillis" in status && status.positionMillis !== undefined) {
      const position = status.positionMillis;

      if ("durationMillis" in status && status.durationMillis !== undefined) {
        const duration = status.durationMillis;

        // Check if we're within 60 seconds of the video ending
        if (position >= duration - 60000 && !is60SecondsCalled) {
          console.log("60 seconds remaining");

          // Set the flag to prevent repeated calls
          setIs60SecondsCalled(true);
        }
      }
    }
  };

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

  const closeModal = () => setModalVisible(false);

  const fetchWorkoutDetails = async () => {
    if (!userData || !id) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`);
      const data = await response.json();
      setWorkout(data);

      // Check if workout is completed
      const completedResponse = await fetch(
        `${API_URL}/api/completedWorkouts?userId=${userData.user_id}`
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
    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: height / 2.4, // Final position
      duration: 1000,
      useNativeDriver: false, // Use false for layout-related animations
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    if (id && userData) {
      setUserId(userData.user_id);
      fetchWorkoutDetails();
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
      <View
        style={[styles.loadingContainer, { backgroundColor: backgroundColor }]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        <CustomText style={[styles.errorText, { color: textColor }]}>
          Workout not found
        </CustomText>
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
          color={textColor}
        />
        <CustomText style={[styles.infoText, { color: subTextColor }]}>
          {text === workoutInfo.duration &&
            `${workout.duration + " mins, " + workout.activity_level}`}
          {text === workoutInfo.tag && `${workout.tag + " workout"}`}
          {text === workout.intensity && `${workout.intensity + " intensity"}`}
          {text === workout.calories_burned &&
            `${workout.calories_burned + " calories burn"}`}
        </CustomText>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
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
        <CustomText style={[styles.workoutName, { color: textColor }]}>
          {workout.name}
        </CustomText>
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

        <CustomText style={[styles.description, { color: iconTextColor }]}>
          {workout.description}
        </CustomText>

        <Animated.View style={[styles.videoHoverButton, { top: slideAnim }]}>
          <TouchableOpacity
            onPress={handleEnterFullscreen}
            style={[styles.startVideoHover, { backgroundColor: textColor }]}
          >
            <CustomText style={[styles.videoText, { color: backgroundColor }]}>
              Start Workout
            </CustomText>
          </TouchableOpacity>
          <View
            style={[styles.dotHover, { backgroundColor: textColor }]}
          ></View>
          <TouchableOpacity
            style={[styles.musicHover, { backgroundColor: textColor }]}
          >
            <CustomText style={[{ color: backgroundColor }]}>Music</CustomText>
          </TouchableOpacity>
        </Animated.View>

        {videoVisible && (
          <Video
            ref={videoRef}
            source={videoSource}
            useNativeControls={true}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
  },
  videoHoverButton: {
    position: "absolute", // Make the tab bar float
    width: width * 1,
    paddingTop: 0,
    marginTop: 0,
    height: 65, // Set the height
    borderRadius: 65 / 2, // Half of height to make it fully rounded
    paddingHorizontal: 20, // Add padding inside the pill
    borderTopWidth: 0,
    borderTopColor: "none",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  startVideoHover: {
    alignItems: "center",
    justifyContent: "center",
    width: "75%",
    height: 65, // Set the height
    borderRadius: 65 / 2,
  },
  dotHover: {
    width: "1.6%",
    height: "10%",
    marginVertical: "auto",
    borderRadius: 100,
  },
  musicHover: {
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
    height: 65, // Set the height
    borderRadius: 100,
    borderTopLeftRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: height / 2.1,
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
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
  },
  videoText: {
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
  },
  description: {
    fontSize: 15,
    lineHeight: 25,
    marginVertical: 20,
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
