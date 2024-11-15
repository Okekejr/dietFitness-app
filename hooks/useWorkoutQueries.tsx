import { API_URL } from "@/constants/apiUrl";
import { UserDataT, WorkoutsT } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

interface Props {
  userData: UserDataT | null;
}

export const useWorkoutQueries = ({ userData }: Props) => {
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<WorkoutsT[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const normalInputRef = useRef<TextInput>(null);

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
  };
};
