import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import WorkoutCompCard from "@/components/workout/workoutCompCard";
import { FlatList } from "react-native";
import { CategoryT, WorkoutsT } from "@/types";
import FeaturedWorkoutsComp from "@/components/featuredWorkout/featuredWorkout";
import { useUserData } from "@/context/userDataContext";
import Header from "@/components/header/header";
import CategoriesComp from "@/components/categories/categoriesComp";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/ui/customText";

// Fetch function
const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  const data = await response.json();
  return data.slice(0, 5);
};

const fetchWorkouts = async (): Promise<WorkoutsT[]> => {
  const response = await fetch(`${API_URL}/api/workouts`);
  if (!response.ok) throw new Error("Failed to fetch workouts");
  return response.json();
};

export default function WorkoutsScreen() {
  const { userData } = useUserData();
  const router = useRouter();

  // State for Search Modal
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<WorkoutsT[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const normalInputRef = useRef<TextInput>(null);

  const fetchCompletedWorkouts = async (): Promise<WorkoutsT[]> => {
    if (!userData) return [];

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

  const fetchFavoritedWorkouts = async (): Promise<WorkoutsT[]> => {
    if (!userData) return [];

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
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: workouts = [],
    isLoading: isWorkoutsLoading,
    isError: isWorkoutsError,
    refetch: refetchWorkouts,
  } = useQuery({
    queryKey: ["allWorkouts"],
    queryFn: fetchWorkouts,
  });

  const {
    data: completed = [],
    isLoading: isCompletedLoading,
    isError: isCompletedError,
    refetch: refetchCompletedWorkouts,
  } = useQuery({
    queryKey: ["completedWorkouts"],
    queryFn: fetchCompletedWorkouts,
  });

  const {
    data: favorited = [],
    isLoading: isFavoritedLoading,
    isError: isFavoritedError,
    refetch: refetchFavoritedWorkouts,
  } = useQuery({
    queryKey: ["favoritedWorkouts"],
    queryFn: fetchFavoritedWorkouts,
  });

  // Open Search Modal
  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchText("");
    setSearchResults([]);
  };

  const handleBackPress = () => {
    setSearchModalVisible(false);
    setSearchText("");
    setSearchResults([]);

    setTimeout(() => {
      if (normalInputRef.current) {
        normalInputRef.current.blur(); // This removes focus from the input
      }
    }, 100);
  };

  useEffect(() => {
    if (searchText === "") {
      setSearchResults([]); // No results when input is empty
      return;
    }
  }, [searchText]);

  // Handle search text change and filter workouts
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === "") {
      setSearchResults([]); // No results when input is empty
      return;
    }

    // Filter workouts based on input
    const filteredResults = workouts.filter((workout) =>
      workout.name.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filteredResults);
  };

  // Navigate to workout details screen
  const handleNavigate = (id: number) => {
    router.push({
      pathname: `/workout/[id]`,
      params: { id },
    });

    handleBackPress();
  };

  if (
    isLoading ||
    isWorkoutsLoading ||
    isCompletedLoading ||
    isFavoritedLoading
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || isWorkoutsError || isCompletedError || isFavoritedError) {
    return (
      <View style={styles.errorContainer}>
        <CustomText style={styles.errorText}>Error fetching data</CustomText>
      </View>
    );
  }

  const workoutCardsConfig = [
    {
      key: "favoriteWorkouts",
      data: favorited,
      cardName: "Favorites",
      bgImgLink: require("../../assets/img/completed.png"),
      cardLink: "/favoriteWorkouts",
    },
    {
      key: "allWorkouts",
      data: workouts,
      cardName: "All Workouts",
      bgImgLink: require("../../assets/img/allWorkouts.png"),
      cardLink: "/allWorkouts",
    },
    {
      key: "completedWorkouts",
      data: completed,
      cardName: "Completed",
      bgImgLink: require("../../assets/img/favImg.png"),
      cardLink: "/completedWorkouts",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header headerTitle="Workouts" />

      {/* Search Modal */}
      <Modal visible={isSearchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            {/* Header Row */}
            <View style={styles.searchHeader}>
              <TextInput
                ref={searchInputRef}
                style={styles.modalSearchInput}
                placeholder="Search Workouts"
                value={searchText}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchText && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={24} color="black" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleBackPress();
                  normalInputRef.current?.blur();
                }}
              >
                <CustomText>Cancel</CustomText>
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleNavigate(item.id)}
                  style={styles.resultItem}
                >
                  <CustomText style={styles.resultText}>{item.name}</CustomText>
                  <CustomText style={styles.resultTime}>
                    {item.duration} mins
                  </CustomText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.noResults}>
                  <CustomText>No results</CustomText>
                </View>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.searchInputContainer}>
          <TouchableOpacity onPress={openSearchModal}>
            <Ionicons
              name="search-outline"
              size={17}
              color="#000"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>

          <TextInput
            ref={normalInputRef}
            placeholder="Search"
            placeholderTextColor="#777"
            style={styles.searchInput}
            onPress={openSearchModal}
          />
        </View>
        {/* Featured Workouts */}
        <FeaturedWorkoutsComp />

        {/* Categories Section */}
        <View style={styles.header}>
          <CustomText style={styles.heading}>Browse by Category</CustomText>
        </View>
        {categories.map((category: CategoryT) => (
          <CategoriesComp key={category.id} category={category} />
        ))}

        <View style={styles.header}>
          <CustomText style={styles.heading}>Your Workouts</CustomText>
        </View>

        <FlatList
          data={workoutCardsConfig}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <WorkoutCompCard
              data={item.data} // Use fetched workout data here
              cardName={item.cardName}
              bgImgLink={item.bgImgLink}
              cardLink={item.cardLink as Href<string>}
            />
          )}
          contentContainerStyle={styles.cardsRow}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginVertical: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 170,
    borderRadius: 10,
    padding: 15,
    maxHeight: "60%",
    overflow: "hidden",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
  },
  modalSearchInput: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: { fontSize: 16 },
  resultTime: { fontSize: 13, color: "#c7c7c7", marginTop: 2 },
  noResults: { padding: 20, alignItems: "center" },
  searchInput: {
    flex: 1,
    color: "#000",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 10,
    padding: 10,
    backgroundColor: "#F0EEED",
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
  },
  eyeIcon: {
    marginHorizontal: 10,
  },
  heading: {
    fontSize: 22,
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
  },
  yourWorkoutsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
