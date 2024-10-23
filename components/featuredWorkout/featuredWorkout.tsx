import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/apiUrl";
import { WorkoutsT } from "@/types";
import WorkoutCard from "../workout/workoutCard";
import { useUserData } from "@/context/userDataContext";

const CACHE_KEY = "featuredWorkouts";
const CACHE_EXPIRY_KEY = "featuredWorkoutsExpiry";

const FeaturedWorkoutsComp = () => {
  const { userData, refetchUserData } = useUserData();
  const [workouts, setWorkouts] = useState<WorkoutsT[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchFeaturedWorkouts = async () => {
      try {
        const now = Date.now();

        // Check if cache exists and is still valid
        const cachedWorkouts = await AsyncStorage.getItem(CACHE_KEY);
        const cacheExpiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);

        if (cachedWorkouts && cacheExpiry && now < Number(cacheExpiry)) {
          setWorkouts(JSON.parse(cachedWorkouts));
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

          setWorkouts(data);
        }
      } catch (error) {
        console.error("Error fetching featured workouts:", error);
        Alert.alert("Error", "Unable to fetch featured workouts.");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      setUserId(userData.user_id);
    }

    fetchFeaturedWorkouts();
    refetchUserData();
  }, []);

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

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Featured</Text>
      {/* <Button title="Clear Cache" onPress={clearCache} /> */}

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <WorkoutCard workout={item} userId={userId} />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 10,
  },
});

export default FeaturedWorkoutsComp;
