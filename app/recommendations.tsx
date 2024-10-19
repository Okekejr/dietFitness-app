import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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

export default function RecommendationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<WorkoutsT[]>([]);
//   const [workoutData, setWorkoutData] = useState<any>(null);

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
        //   setWorkoutData(data.workoutData); // Metadata for the summary box
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
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDetail}>Duration: {item.duration} mins</Text>
        <Text style={styles.cardDetail}>Intensity: {item.intensity}</Text>
        <Text style={styles.cardDetail}>Level: {item.activity_level}</Text>
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
      <Text style={styles.heading}>🎯 Your Personalized Recommendations</Text>
      <Text style={styles.subHeading}>Based on your preferences</Text>

      {/* Summary Box
      {workoutData && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Workouts per Week: {workoutData.workoutsPerWeek}
          </Text>
          <Text style={styles.summaryText}>
            Intensity: {workoutData.intensity}
          </Text>
          <Text style={styles.summaryText}>Diet: (Coming Soon)</Text>
        </View>
      )} */}

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecommendationCard}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
        <Text style={styles.buttonText}>Get Started</Text>
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
    fontWeight: "bold",
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
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
