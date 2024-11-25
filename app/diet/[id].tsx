import BackButton from "@/components/ui/backButton";
import CustomText from "@/components/ui/customText";
import { API_URL } from "@/constants/apiUrl";
import { DietPlanEntity } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResizeMode, Video } from "expo-av";

const { height, width } = Dimensions.get("window");

const videoSource = {
  uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

const MealDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const subTextColor = useThemeColor({}, "subText");
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef<Video | null>(null);

  const { data: meal, isLoading: mealLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/userDiet/${id}`);
      if (!response.ok) throw new Error("Failed to fetch club data");
      return response.json() as Promise<DietPlanEntity>;
    },
    enabled: !!id,
  });

  useEffect(() => {
    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: height / 1.12, // Final position
      duration: 1000,
      useNativeDriver: false, // Use false for layout-related animations
    }).start();
  }, [slideAnim]);

  const handleEnterFullscreen = async () => {
    setVideoVisible(true);

    // Wait for the video to be fully loaded and start fullscreen
    if (videoRef.current) {
      await videoRef.current.presentFullscreenPlayer();
    }
  };

  if (mealLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.container}>
        <CustomText style={[styles.errorText, { color: textColor }]}>
          Meal not found
        </CustomText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      {/* Diet Image with Back Button  */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: meal.image_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          placeholder={require("../../assets/img/avatar-placeholder.png")}
        />

        <BackButton />
      </View>

      <View style={styles.detailsContainer}>
        <CustomText style={[styles.title, { color: textColor }]}>
          {meal.name}
        </CustomText>
        <CustomText style={[styles.goal, , { color: textColor }]}>
          Goal: {meal.goal}
        </CustomText>
        <CustomText style={[styles.calories, , { color: textColor }]}>
          Calories: {meal.calories} kcal
        </CustomText>
        <CustomText style={[styles.mealType, , { color: textColor }]}>
          Type: {meal.meal_type}
        </CustomText>
        <CustomText style={[styles.mealTime, , { color: textColor }]}>
          Time: {meal.meal_time}
        </CustomText>
        <CustomText style={[styles.description, { color: textColor }]}>
          {meal.description}
        </CustomText>
      </View>

      <View style={styles.section}>
        <CustomText style={[styles.sectionTitle, , { color: textColor }]}>
          Ingredients
        </CustomText>
        {meal.ingredients?.map((ingredient, index) => (
          <CustomText
            key={index}
            style={[styles.ingredient, { color: subTextColor }]}
          >
            • {ingredient}
          </CustomText>
        ))}
      </View>

      <View style={styles.section}>
        <CustomText style={[styles.sectionTitle, { color: textColor }]}>
          Dietary Restrictions
        </CustomText>
        {meal.dietary_restrictions?.map((restriction, index) => (
          <CustomText
            key={index}
            style={[styles.restriction, { color: subTextColor }]}
          >
            • {restriction}
          </CustomText>
        ))}
      </View>

      <Animated.View style={[styles.videoHoverButton, { top: slideAnim }]}>
        <TouchableOpacity
          onPress={handleEnterFullscreen}
          style={[styles.startVideoHover, { backgroundColor: textColor }]}
        >
          <CustomText style={[styles.videoText, { color: backgroundColor }]}>
            Watch Tutorial
          </CustomText>
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
        />
      )}
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
    justifyContent: "center",
    zIndex: 10,
  },
  startVideoHover: {
    alignItems: "center",
    justifyContent: "center",
    width: "75%",
    height: 65, // Set the height
    borderRadius: 65 / 2,
  },
  videoText: {
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "red",
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
  detailsContainer: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 20,
  },
  goal: {
    fontSize: 16,
    marginBottom: 4,
  },
  calories: {
    fontSize: 16,
    marginBottom: 4,
  },
  mealType: {
    fontSize: 16,
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 25,
    marginTop: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 4,
    color: "#333",
  },
  ingredient: {
    fontSize: 16,
    color: "#555",
  },
  restriction: {
    fontSize: 16,
    color: "#555",
  },
});

export default MealDetailScreen;
