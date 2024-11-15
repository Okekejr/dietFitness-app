import BackButton from "@/components/ui/backButton";
import CustomText from "@/components/ui/customText";
import { API_URL } from "@/constants/apiUrl";
import { DietPlanEntity } from "@/types";
import { getYouTubeVideoId } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { Dimensions } from "react-native";
import { Image } from "expo-image";
import { ActivityIndicator, View, StyleSheet, ScrollView } from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import * as Haptics from "expo-haptics";

const { height } = Dimensions.get("window");

const MealDetailScreen = () => {
  const { id } = useLocalSearchParams();

  const { data: meal, isLoading: mealLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/userDiet/${id}`);
      if (!response.ok) throw new Error("Failed to fetch club data");
      return response.json() as Promise<DietPlanEntity>;
    },
    enabled: !!id,
  });

  const videoId = getYouTubeVideoId(meal ? meal.recipe_url : "");
  const video = useRef<YoutubeIframeRef>(null);

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
        <CustomText style={styles.errorText}>Meal not found</CustomText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
        <CustomText style={styles.title}>{meal.name}</CustomText>
        <CustomText style={styles.goal}>Goal: {meal.goal}</CustomText>
        <CustomText style={styles.calories}>
          Calories: {meal.calories} kcal
        </CustomText>
        <CustomText style={styles.mealType}>Type: {meal.meal_type}</CustomText>
        <CustomText style={styles.mealTime}>Time: {meal.meal_time}</CustomText>
        <CustomText style={styles.description}>{meal.description}</CustomText>
      </View>

      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Ingredients</CustomText>
        {meal.ingredients?.map((ingredient, index) => (
          <CustomText key={index} style={styles.ingredient}>
            • {ingredient}
          </CustomText>
        ))}
      </View>

      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>
          Dietary Restrictions
        </CustomText>
        {meal.dietary_restrictions?.map((restriction, index) => (
          <CustomText key={index} style={styles.restriction}>
            • {restriction}
          </CustomText>
        ))}
      </View>

      {/* Recipe Video */}
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Recipe Video</CustomText>
        {videoId != "" && (
          <YoutubePlayer ref={video} height={300} videoId={videoId} />
        )}
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
    color: "#333",
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
    lineHeight: 20,
    color: "#666",
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
