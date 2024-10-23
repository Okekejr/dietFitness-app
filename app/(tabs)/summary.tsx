import Header from "@/components/header/header";
import PastWorkouts from "@/components/workout/pastWorkouts";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import { CompletedWorkout } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  Animated,
  Text,
  LayoutChangeEvent,
} from "react-native";

const Tabs = ["Overview", "History"];

export default function SummaryScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const tabWidths = useRef<number[]>([]);
  const { userData } = useUserData();

  const fetchCompletedWorkouts = async (): Promise<CompletedWorkout[]> => {
    if (userData) {
      const userId = userData.user_id;

      try {
        const response = await fetch(
          `${API_URL}/api/completedWorkouts/getCompleted?userId=${userId}`
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

  const {
    data: completed = [],
    isLoading: isCompletedLoading,
    isError: isCompletedError,
    refetch: refetchCompletedWorkouts,
  } = useQuery({
    queryKey: ["getCompleted"],
    queryFn: fetchCompletedWorkouts,
  });

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    // Calculate the exact position of the indicator
    const translateX = tabWidths.current
      .slice(0, index)
      .reduce((acc, width) => acc + width + 20, 0);

    Animated.timing(indicatorPosition, {
      toValue: translateX,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { width } = event.nativeEvent.layout;
    tabWidths.current[index] = width;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Summary" />
      <View style={styles.tabsContainer}>
        {Tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTabPress(index)}
            style={styles.tab}
            onLayout={(event) => onTabLayout(event, index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { transform: [{ translateX: indicatorPosition }] },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 0 ? (
          <Text style={styles.tabContent}>Overview Content</Text>
        ) : (
          <PastWorkouts completedWorkouts={completed} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: 25,
    marginTop: 10,
    marginBottom: 15,
    gap: 35,
  },
  tab: {
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#aaa",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#4F46E5",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: 80,
    backgroundColor: "#4F46E5",
    borderRadius: 1.5,
  },
  content: {
    padding: 20,
  },
  tabContent: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
});
