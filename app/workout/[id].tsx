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
  Button,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getWorkoutPageIcons, workoutInfoT } from "@/utils";
import LottieView from "lottie-react-native";
import { useUserData } from "@/context/userDataContext";
import BackButton from "@/components/ui/backButton";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResizeMode, Video } from "expo-av";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Calendar from "expo-calendar";
import { useWorkoutId } from "@/hooks/useWorkoutId";
import AddCustomActivity from "@/components/customActivity/customActivityModal";

const { height, width } = Dimensions.get("window");

const videoSource = {
  uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

const WorkoutDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const {
    setIsPermissionGranted,
    createOrGetCalendar,
    setUserId,
    fetchWorkoutDetails,
    fetchFavoritesStatus,
    handleFavorite,
    handleEnterFullscreen,
    setIsSchedule,
    handlePlaybackStatusUpdate,
    addEventToCalendar,
    onDateChange,
    closeModal,
    isModalVisible,
    selectedDate,
    isSchedule,
    videoVisible,
    videoRef,
    isFavorite,
    isCompleted,
    userId,
    workout,
    loading,
  } = useWorkoutId({
    id: id,
    userData: userData,
  });
  const slideAnim = useRef(new Animated.Value(height)).current;
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const subTextColor = useThemeColor({}, "subText");
  const iconTextColor = useThemeColor({}, "icon");
  const [customActivityModalVisible, setCustomActivityModalVisible] =
    useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        setIsPermissionGranted(true);
      } else {
        console.log("Calendar permission denied");
      }
    })();
  }, []);

  useEffect(() => {
    createOrGetCalendar();
  }, []);

  useEffect(() => {
    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: height / 1.12, // Final position
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

  const handleAddCustomActivity = () => {
    setCustomActivityModalVisible(true);
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
    <>
      <View style={styles.fixedButtonsContainer}>
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
      <ScrollView
        style={[styles.container, { backgroundColor: backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
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
        </View>

        <View style={styles.detailsContainer}>
          <CustomText style={[styles.workoutName, { color: textColor }]}>
            {workout.name}
          </CustomText>
          {workoutIconsTexts({ duration: workout.duration }, workout.duration)}
          {workoutIconsTexts({ tag: workout.tag }, workout.tag)}
          {workoutIconsTexts(
            { intensity: workout.intensity },
            workout.intensity
          )}
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

          {/* Modal to Set Reminder */}
          <Modal
            visible={isSchedule}
            transparent
            animationType="fade"
            onRequestClose={() => setIsSchedule(false)}
          >
            <View style={styles.modalOverlay}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsSchedule(false)}
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>

              {/* Date Picker */}
              <View
                style={[
                  styles.datePickerContainer,
                  { backgroundColor: textColor },
                ]}
              >
                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display="spinner"
                  onChange={onDateChange}
                />
                <Button
                  title="Set Reminder"
                  onPress={() => addEventToCalendar(selectedDate)}
                />
              </View>
            </View>
          </Modal>

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

              <CustomText style={styles.modalText}>
                Workout Complete!
              </CustomText>
            </View>
          </Modal>
        </View>
      </ScrollView>

      <Animated.View style={[styles.videoHoverButton, { top: slideAnim }]}>
        {workout.video_url !== null ? (
          <TouchableOpacity
            onPress={handleEnterFullscreen}
            style={[styles.startVideoHover, { backgroundColor: textColor }]}
          >
            <CustomText style={[styles.videoText, { color: backgroundColor }]}>
              Start Workout
            </CustomText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => handleAddCustomActivity()}
            style={[styles.startVideoHover, { backgroundColor: textColor }]}
          >
            <CustomText style={[styles.videoText, { color: backgroundColor }]}>
              Mark Workout Complete
            </CustomText>
          </TouchableOpacity>
        )}

        <Modal visible={customActivityModalVisible} animationType="slide">
          <AddCustomActivity
            onClose={() => setCustomActivityModalVisible(false)}
          />
        </Modal>

        <View style={[styles.dotHover, { backgroundColor: textColor }]}></View>
        <TouchableOpacity
          onPress={() => setIsSchedule(true)}
          style={[styles.musicHover, { backgroundColor: textColor }]}
        >
          <CustomText style={[{ color: backgroundColor }]}>
            <Ionicons name="time" size={28} color={backgroundColor} />
          </CustomText>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for the animated view
  },
  fixedButtonsContainer: {
    position: "absolute",
    top: 0, // Adjust for safe area (if needed)
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure it stays above all other content
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  datePickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    width: 300,
  },
});

export default WorkoutDetailsScreen;
