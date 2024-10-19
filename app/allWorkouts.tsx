import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import WorkoutCard from "@/components/workout/workoutCard";
import { getUserId } from "supertokens-react-native";
import { WorkoutsT } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import FilterModal from "@/components/modal/filterModal";

async function fetchWorkouts(): Promise<WorkoutsT[]> {
  const response = await fetch(`${API_URL}/api/workouts`);
  if (!response.ok) throw new Error("Failed to fetch workouts");
  return response.json();
}

export default function AllWorkoutsScreen() {
  const router = useRouter();
  const {
    data: workouts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["allWorkouts"],
    queryFn: fetchWorkouts,
  });

  const [userId, setUserId] = React.useState<string>("");
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutsT[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    duration: [],
    activityLevel: [],
    intensity: [],
  });

  // Fetch user ID from SuperTokens
  React.useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setUserId(userId);
    };

    fetchUserId();
    setFilteredWorkouts(workouts);
  }, []);

  const applyFilters = (newFilters: any) => {
    setFilters(newFilters);
    const filtered = workouts.filter((workout) => {
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

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error fetching workouts</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
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

      <FlatList
        data={filteredWorkouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <WorkoutCard workout={item} userId={userId} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text>No workouts available</Text>}
      />

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
  backButton: {
    backgroundColor: "#000",
    borderRadius: 25,
    padding: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});
