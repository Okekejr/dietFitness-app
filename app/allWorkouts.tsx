import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
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
import { WorkoutsT } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import FilterModal from "@/components/modal/filterModal";
import { useUserData } from "@/context/userDataContext";
import CustomText from "@/components/ui/customText";

async function fetchWorkouts(): Promise<WorkoutsT[]> {
  const response = await fetch(`${API_URL}/api/workouts`);
  if (!response.ok) throw new Error("Failed to fetch workouts");
  return response.json();
}

export default function AllWorkoutsScreen() {
  const router = useRouter();
  const { userData } = useUserData();
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
  useEffect(() => {
    setFilteredWorkouts(workouts);

    if (userData) {
      setUserId(userData.user_id);
    }
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
        <CustomText style={styles.errorText}>
          Error fetching workouts
        </CustomText>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Number of Workouts and Filter Button */}
      <View style={styles.headerRow}>
        <CustomText style={styles.workoutCount}>
          {filteredWorkouts.length} workouts
        </CustomText>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <CustomText style={styles.filterButtonText}>Filters</CustomText>
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
          ListEmptyComponent={<CustomText>No workouts available</CustomText>}
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
    fontFamily: "HostGrotesk-Medium",
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
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#c7c7c7",
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
