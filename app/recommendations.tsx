import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types/workout";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/ui/customText";
import { DietPlanEntity, recommendationData } from "@/types";
import { workoutDays } from "@/utils";

export default function RecommendationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<WorkoutsT[]>([]);
  const [workoutData, setWorkoutData] = useState<recommendationData>();
  const [meals, setMeals] = useState<DietPlanEntity[]>([]);

  // Fetch the user's workout plan from the backend
  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const response = await fetch(`${API_URL}/api/recommendation`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.workoutPlan) {
          setRecommendations(data.workoutPlan.slice(0, 3)); // Show only 3 workouts
          setWorkoutData(data); // Store entire workout data including diet and preferences
          setMeals(data.dietPlan || []); // Assuming diet plan includes meals
        } else {
          console.error("No workout plan found.");
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  const renderRecommendationCard = ({ item }: { item: WorkoutsT }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <CustomText style={styles.cardTitle}>{item.name}</CustomText>
        <CustomText style={styles.cardDetail}>
          Duration: {item.duration} mins
        </CustomText>
        <CustomText style={styles.cardDetail}>
          Intensity: {item.intensity}
        </CustomText>
        <CustomText style={styles.cardDetail}>
          Level: {item.activity_level}
        </CustomText>
      </View>
    </View>
  );

  const renderMealCard = ({ item }: { item: any }) => (
    <View style={styles.mealCard}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <CustomText style={styles.cardTitle}>{item.name}</CustomText>
        <CustomText style={styles.cardDetail}>
          Calories: {item.calories}
        </CustomText>
        <CustomText style={styles.cardDetail}>
          Time: {item.meal_type} meal
        </CustomText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomText style={styles.heading}>
        🎯 Your Personalized Recommendations
      </CustomText>
      <CustomText style={styles.subHeading}>
        Based on your preferences
      </CustomText>

      {/* Personalized Summary Box */}
      {workoutData && (
        <View style={styles.summaryBox}>
          <CustomText style={styles.summaryText}>
            Activity Level: {workoutData.workoutData.activity_level}
          </CustomText>
          <CustomText style={styles.summaryText}>
            Workouts per Week:{" "}
            {workoutDays(workoutData.workoutData.activity_level) || "3"}
          </CustomText>
        </View>
      )}

      {/* Meal Recommendations Section */}
      {meals.length > 0 && (
        <View style={styles.mealList}>
          <CustomText style={styles.sectionTitle}>
            Some Meal Recommendations
          </CustomText>
          <FlatList
            data={meals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMealCard}
            horizontal
            contentContainerStyle={styles.mealList}
          />
        </View>
      )}

      {/* Workout Recommendations Section */}
      <CustomText style={styles.sectionTitle}>
        Some Workout Recommendations
      </CustomText>
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecommendationCard}
        contentContainerStyle={styles.listContent}
      />

      {/* Motivational Quote */}
      <View style={styles.motivationBox}>
        <CustomText style={styles.motivationText}>
          "Push yourself, because no one else is going to do it for you."
        </CustomText>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
        <CustomText style={styles.buttonText}>Get Started</CustomText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 40,
  },
  summaryBox: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealList: { marginBottom: 10, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    height: "auto",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: "#555",
  },
  motivationBox: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
  },
  motivationText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});
