import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Button,
} from "react-native";
import { WorkoutsT } from "@/types";
import WorkoutCard from "../workout/workoutCard";
import { useUserData } from "@/context/userDataContext";
import CustomText from "../ui/customText";

interface FeaturedWorkoutProps {
  loading: boolean;
  featuredWorkouts: WorkoutsT[];
  clearCache: () => Promise<void>;
  fetchFeaturedWorkouts: () => Promise<void>;
}

const FeaturedWorkoutsComp = ({
  loading,
  fetchFeaturedWorkouts,
  featuredWorkouts,
  clearCache,
}: FeaturedWorkoutProps) => {
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
    }
    fetchFeaturedWorkouts();
    refetchUserData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  return (
    <View style={styles.container}>
      <CustomText style={styles.header}>Featured</CustomText>
      {/* <Button title="Clear Cache" onPress={clearCache} /> */}

      <FlatList
        data={featuredWorkouts}
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
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 10,
  },
});

export default FeaturedWorkoutsComp;
