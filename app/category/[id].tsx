import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import FilterModal from "@/components/modal/filterModal";
import WorkoutCard from "@/components/workout/workoutCard";
import { CategoryT, WorkoutsT } from "@/types";
import { useUserData } from "@/context/userDataContext";
import BackButton from "@/components/ui/backButton";

const { height } = Dimensions.get("window");

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const [category, setCategory] = useState<CategoryT | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutsT[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutsT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    duration: [],
    activityLevel: [],
    intensity: [],
  });

  useEffect(() => {
    const fetchCategoryAndWorkouts = async () => {
      try {
        // Fetch category details
        const categoryResponse = await fetch(`${API_URL}/api/categories/${id}`);
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch workouts for the category
        const workoutsResponse = await fetch(
          `${API_URL}/api/categories/${id}/workouts`
        );
        const workoutsData = await workoutsResponse.json();
        setWorkouts(workoutsData);
        setFilteredWorkouts(workoutsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (id && userData) {
      fetchCategoryAndWorkouts();
      setUserId(userData.user_id);
    }
  }, [id]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-width Image Section with Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: category.image_url, cache: "force-cache" }}
          style={styles.image}
        />
        <BackButton />
        <View style={styles.overlay}>
          <Text style={styles.categoryName}>{category.category_name}</Text>
          {category.description && (
            <Text style={styles.description}>{category.description}</Text>
          )}
        </View>
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

      {/* Workouts List */}
      <ScrollView style={styles.cardAlign}>
        <FlatList
          data={filteredWorkouts}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} userId={userId} />
          )}
        />
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onApplyFilters={applyFilters}
        onClose={() => setFilterModalVisible(false)}
        activeFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardAlign: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: height / 1.89,
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
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  categoryName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
    maxWidth: 340,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 16,
  },
  workoutCount: {
    fontSize: 18,
    fontWeight: "bold",
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
  list: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});
