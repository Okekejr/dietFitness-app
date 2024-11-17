import { API_URL } from "@/constants/apiUrl";
import { UserDataT, WorkoutsT } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  userData: UserDataT | null;
}

const CACHE_KEY = "featuredWorkouts";
const CACHE_EXPIRY_KEY = "featuredWorkoutsExpiry";

export const useWorkoutQueries = ({ userData }: Props) => {
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<WorkoutsT[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const normalInputRef = useRef<TextInput>(null);
  const [featWorkouts, setFeatWorkouts] = useState<WorkoutsT[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchFeaturedWorkouts = async () => {
    try {
      const now = Date.now();

      // Check if cache exists and is still valid
      const cachedWorkouts = await AsyncStorage.getItem(CACHE_KEY);
      const cacheExpiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);

      if (cachedWorkouts && cacheExpiry && now < Number(cacheExpiry)) {
        setFeatWorkouts(JSON.parse(cachedWorkouts));
        console.log("Using cached workouts");
      } else {
        console.log("Cache expired or not found, fetching new workouts");

        // Clear expired cache
        await AsyncStorage.removeItem(CACHE_KEY);
        await AsyncStorage.removeItem(CACHE_EXPIRY_KEY);

        // Fetch new workouts from API
        const response = await fetch(`${API_URL}/api/featuredWorkouts`);
        const data = await response.json();

        // Cache the new workouts and set a new expiry (7 days)
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(
          CACHE_EXPIRY_KEY,
          (now + 7 * 24 * 60 * 60 * 1000).toString()
        );

        setFeatWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching featured workouts:", error);
      Alert.alert("Error", "Unable to fetch featured workouts.");
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_EXPIRY_KEY);
      Alert.alert("Success", "Cached workouts cleared.");
    } catch (error) {
      console.error("Error clearing cache:", error);
      Alert.alert("Error", "Failed to clear cache.");
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

  return {
    categories,
    workouts,
    completed,
    favorited,
    isLoading,
    isWorkoutsLoading,
    isCompletedLoading,
    isFavoritedLoading,
    isError,
    isCompletedError,
    isWorkoutsError,
    isFavoritedError,
    isSearchModalVisible,
    setSearchModalVisible,
    setSearchText,
    setSearchResults,
    searchText,
    searchInputRef,
    normalInputRef,
    searchResults,
    fetchFeaturedWorkouts,
    clearCache,
    featWorkouts,
    loading,
    setLoading,
  };
};
