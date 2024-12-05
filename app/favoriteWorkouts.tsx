import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";
import {
  ActivityIndicator,
  Button,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useUserData } from "@/context/userDataContext";
import { WorkoutsT } from "@/types";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import FilterModal from "@/components/modal/filterModal";
import WorkoutCard from "@/components/workout/workoutCard";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/ui/customText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFilter } from "@/hooks/useFilter";

export default function FavoriteWorkoutsScreen() {
  const router = useRouter();
  const { userData } = useUserData();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const fetchFavoritedWorkouts = async (): Promise<WorkoutsT[]> => {
    if (userData) {
      const userId = userData.user_id;

      try {
        const response = await fetch(
          `${API_URL}/api/favorites?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch favorited workouts");
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching favorited workouts:", error);
        throw error;
      }
    } else {
      console.warn("No user data available.");
      return [];
    }
  };

  const {
    data: favorited = [],
    isLoading: isFavoritedLoading,
    isError: isFavoritedError,
    refetch: refetchFavoritedWorkouts,
  } = useQuery({
    queryKey: ["favoritedWorkouts"],
    queryFn: fetchFavoritedWorkouts,
  });

  const [userId, setUserId] = useState<string>("");
  const {
    filterModalVisible,
    filteredWorkouts,
    activeFilterCount,
    filters,
    setFilterModalVisible,
    setFilteredWorkouts,
    applyFilters,
  } = useFilter({ workouts: favorited });

  useEffect(() => {
    setFilteredWorkouts(favorited);

    if (userData) {
      setUserId(userData.user_id);
    }
  }, []);

  if (isFavoritedLoading) {
    return (
      <View
        style={[styles.centeredContainer, { backgroundColor: backgroundColor }]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isFavoritedError) {
    return (
      <View
        style={[styles.centeredContainer, { backgroundColor: backgroundColor }]}
      >
        <CustomText style={[styles.errorText, { color: textColor }]}>
          Error fetching workouts
        </CustomText>
        <Button title="Retry" onPress={() => refetchFavoritedWorkouts()} />
      </View>
    );
  }

  if (favorited.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: backgroundColor }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredContainer}>
          <CustomText style={[styles.emptyText, { color: textColor }]}>
            You havent saved any workouts yet
          </CustomText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.back()}
          >
            <CustomText style={[styles.loginButtonText, { color: textColor }]}>
              Explore Workouts
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
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
        <CustomText style={[styles.workoutCount, { color: textColor }]}>
          {filteredWorkouts.length} workouts
        </CustomText>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: textColor }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <CustomText
            style={[styles.filterButtonText, { color: backgroundColor }]}
          >
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </CustomText>
          <Ionicons name="filter-outline" size={18} color={backgroundColor} />
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
    marginBottom: 20,
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
  closeButton: {
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  emptyText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "red",
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
