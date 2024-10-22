import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUserData } from "@/context/userDataContext";
import { useQuery } from "@tanstack/react-query";
import { WorkoutsT } from "@/types";
import { API_URL } from "@/constants/apiUrl";
import {
  ActivityIndicator,
  Button,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WorkoutCard from "@/components/workout/workoutCard";
import FilterModal from "@/components/modal/filterModal";

export default function CompletedWorkoutsScreen() {
  const router = useRouter();
  const { userData } = useUserData();

  const fetchCompletedWorkouts = async (): Promise<WorkoutsT[]> => {
    if (userData) {
      const userId = userData.user_id;

      try {
        const response = await fetch(
          `${API_URL}/api/completedWorkouts?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch completed workouts");
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching completed workouts:", error);
        throw error;
      }
    } else {
      console.warn("No user data available.");
      return [];
    }
  };

  const {
    data: completed = [],
    isLoading: isCompletedLoading,
    isError: isCompletedError,
    refetch: refetchCompletedWorkouts,
  } = useQuery({
    queryKey: ["completedWorkouts"],
    queryFn: fetchCompletedWorkouts,
  });

  const [userId, setUserId] = useState<string>("");
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutsT[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    duration: [],
    activityLevel: [],
    intensity: [],
  });

  useEffect(() => {
    setFilteredWorkouts(completed);

    if (userData) {
      setUserId(userData.user_id);
    }
  }, []);

  const applyFilters = (newFilters: any) => {
    setFilters(newFilters);
    const filtered = completed.filter((workout) => {
      const matchesDuration = newFilters.duration.length
        ? newFilters.duration.some((duration: string) => {
            if (duration === "15-20 mins")
              return workout.duration >= 15 && workout.duration <= 20;
            if (duration === "25-30 mins")
              return workout.duration >= 25 && workout.duration <= 30;
            if (duration === ">30 mins") return workout.duration > 30;
            return false;
          })
        : true;

      const matchesActivity = newFilters.activityLevel.length
        ? newFilters.activityLevel.includes(workout.activity_level)
        : true;

      const matchesIntensity = newFilters.intensity.length
        ? newFilters.intensity.includes(workout.intensity)
        : true;

      return matchesDuration && matchesActivity && matchesIntensity;
    });

    setFilteredWorkouts(filtered);
    setFilterModalVisible(false);
  };

  if (isCompletedLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isCompletedError) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error fetching workouts</Text>
        <Button title="Retry" onPress={() => refetchCompletedWorkouts()} />
      </View>
    );
  }

  if (completed.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.replace("/workouts")}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>
            You havent completed any workouts yet
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace("/workouts")}
          >
            <Text style={styles.loginButtonText}>Explore Workouts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/workouts")}
        >
          <Ionicons name="chevron-back-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Number of Workouts and Filter Button */}
      <View style={styles.headerRow}>
        <Text style={styles.workoutCount}>
          {filteredWorkouts.length} workouts
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
          <Ionicons name="filter-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardAlign}>
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} userId={userId} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text>No workouts available</Text>}
        />
      </View>

      <FilterModal
        visible={filterModalVisible}
        onApplyFilters={applyFilters}
        onClose={() => setFilterModalVisible(false)}
        activeFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  cardAlign: {
    paddingHorizontal: 16,
  },
  workoutCount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
    color: "#fff",
    marginRight: 5,
  },
  topBar: {
    alignItems: "flex-start",
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
  },
  backButton: {
    backgroundColor: "#000",
    borderRadius: 25,
    padding: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  emptyText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
