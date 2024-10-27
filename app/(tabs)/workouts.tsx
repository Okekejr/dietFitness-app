import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Href, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import WorkoutCompCard from "@/components/workout/workoutCompCard";
import { FlatList } from "react-native";
import { CategoryT, WorkoutsT } from "@/types";
import FeaturedWorkoutsComp from "@/components/featuredWorkout/featuredWorkout";
import { useUserData } from "@/context/userDataContext";
import Header from "@/components/header/header";
import CategoriesComp from "@/components/categories/categoriesComp";

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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     refetch();
  //     refetchWorkouts();
  //     refetchCompletedWorkouts();
  //     refetchFavoritedWorkouts();
  //   }, [
  //     refetch,
  //     refetchWorkouts,
  //     refetchCompletedWorkouts,
  //     refetchFavoritedWorkouts,
  //   ])
  // );

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
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching categories</Text>
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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Featured Workouts */}
        <FeaturedWorkoutsComp />

        {/* Categories Section */}
        <View style={styles.header}>
          <Text style={styles.heading}>Browse by Category</Text>
        </View>
        {categories.map((category: CategoryT) => (
          <CategoriesComp key={category.id} category={category} />
        ))}

        <View style={styles.header}>
          <Text style={styles.heading}>Your Workouts</Text>
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
  heading: {
    fontSize: 22,
    fontWeight: "bold",
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
  subHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
