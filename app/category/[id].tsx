import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import FilterModal from "@/components/modal/filterModal";
import WorkoutCard from "@/components/workout/workoutCard";
import { CategoryT, WorkoutsT } from "@/types";
import { useUserData } from "@/context/userDataContext";
import BackButton from "@/components/ui/backButton";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFilter } from "@/hooks/useFilter";

const { height } = Dimensions.get("window");

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const [category, setCategory] = useState<CategoryT | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutsT[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const {
    filterModalVisible,
    filteredWorkouts,
    filters,
    activeFilterCount,
    applyFilters,
    setFilterModalVisible,
    setFilteredWorkouts,
  } = useFilter({
    workouts: workouts,
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
        <CustomText style={[styles.errorText, { color: textColor }]}>
          Category not found
        </CustomText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      {/* Full-width Image Section with Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: category.image_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          placeholder={require("../../assets/img/avatar-placeholder.png")}
        />
        <BackButton />
        <View style={styles.overlay}>
          <CustomText style={styles.categoryName}>
            {category.category_name}
          </CustomText>
          {category.description && (
            <CustomText style={styles.description}>
              {category.description}
            </CustomText>
          )}
        </View>
      </View>

      {/* Number of Workouts and Filter Button */}
      <View style={styles.headerRow}>
        <CustomText style={[styles.workoutCount, { color: textColor }]}>
          {filteredWorkouts.length} workouts
        </CustomText>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: textColor }]}
          onPress={() => {
            Haptics.selectionAsync();
            setFilterModalVisible(true);
          }}
        >
          <CustomText
            style={[styles.filterButtonText, { color: backgroundColor }]}
          >
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </CustomText>
          <Ionicons name="filter-outline" size={18} color={backgroundColor} />
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
    fontFamily: "HostGrotesk-Medium",
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
    fontFamily: "HostGrotesk-Medium",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
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
