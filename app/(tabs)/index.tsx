import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUserData } from "@/context/userDataContext";
import { useRouter } from "expo-router";
import { AssignedWorkoutT, AssignedDietT } from "@/types";
import useStreak from "@/hooks/useStreak";
import Header from "@/components/header/header";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";
import { useHomeQueries } from "@/hooks/useHomeQueries";
import { calculateDaysBetweenDates } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

const CARD_WIDTH = 200;

export default function HomeScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    schedule,
    loading,
    setLoading,
    currentWeekNum,
    fetchUserDataWithRetry,
    generateOrFetchWorkoutPlan,
    fetchWorkoutDetails,
    isCompleted,
  } = useHomeQueries({ userData, userId, refetchUserData });
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const { streak } = useStreak(userId);

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
      setLoading(false);
    } else {
      fetchUserDataWithRetry();
    }
  }, [userData]);

  useEffect(() => {
    // Load schedule only when userId is ready
    if (userId) {
      refetchUserData();
      generateOrFetchWorkoutPlan();
    }
  }, [userId]);

  useEffect(() => {
    if (schedule.length > 0 && userData?.week_start_date) {
      const daysSinceStart = calculateDaysBetweenDates(
        new Date(userData.week_start_date),
        new Date()
      );

      const currentDay = Math.min(daysSinceStart + 1, 7); // Ensure it doesn't exceed 7
      setSelectedDay(currentDay);

      // Automatically scroll to the current day's card
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: (currentDay - 1) * CARD_WIDTH,
            animated: true,
          });
        }
      }, 100); // Delay to ensure scroll happens after render
    }
  }, [schedule, userData]);

  const handleDaySelect = (day: number) => setSelectedDay(day);

  const itemsForDay = schedule.find((item) => item.day === selectedDay);

  const handleWorkoutClick = (id: number) => {
    router.push({
      pathname: `/workout/[id]`,
      params: { id: id.toString() },
    });
  };

  const handleDietClick = (id: number) => {
    router.push({
      pathname: `/diet/[id]`,
      params: { id: id.toString() },
    });
  };

  const renderDayButton = (day: number) => {
    // Find the schedule for the selected day
    const itemsForDay = schedule.find((item) => item.day === day);

    // Check if there's no workout or diet for the day
    const isRestDay =
      !itemsForDay ||
      (itemsForDay.workouts.length === 0 && itemsForDay.diets.length === 0);

    // Count workouts and meals
    const workoutCount = itemsForDay ? itemsForDay.workouts.length : 0;
    const mealCount = itemsForDay ? itemsForDay.diets.length : 0;

    return (
      <TouchableOpacity
        key={day}
        onPress={() => {
          Haptics.selectionAsync();
          handleDaySelect(day);
        }}
        style={[
          styles.calendarCard,
          selectedDay === day && styles.selectedCalendarCard,
        ]}
      >
        <View style={styles.dayInfoContainer}>
          <View
            style={[
              styles.borderIndicator,
              { backgroundColor: day === selectedDay ? "green" : "#E0E0E0" },
            ]}
          />
          <CustomText style={styles.dayText}>Day {day}</CustomText>
        </View>

        {/* Short Info: Display workout and meal counts */}
        {!isRestDay && (
          <View style={styles.summaryContainer}>
            <CustomText style={styles.summaryText}>
              Today:
              {"\n"}• {workoutCount} workout{workoutCount !== 1 && "s"}
              {"\n"}• {mealCount} meal{mealCount !== 1 && "s"}
            </CustomText>
          </View>
        )}

        {/* If no workout or diet for the day */}
        {isRestDay && (
          <CustomText style={styles.restDayText}>Rest day</CustomText>
        )}
      </TouchableOpacity>
    );
  };

  const renderWorkout = ({ item }: { item: AssignedWorkoutT }) => {
    fetchWorkoutDetails(item.workout.id.toString());

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleWorkoutClick(item.workout.id);
        }}
      >
        <View style={styles.dietContent}>
          <CustomText style={styles.workoutName}>
            {item.workout.name}
          </CustomText>
          <CustomText>Duration: {item.workout.duration} mins</CustomText>
          <CustomText>Description: {item.workout.description}</CustomText>
          <CustomText>Intensity: {item.workout.intensity}</CustomText>
          <CustomText>
            Calories: - {item.workout.calories_burned} kcal
          </CustomText>
          {isCompleted && (
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <CustomText style={styles.completedText}>Completed</CustomText>
            </View>
          )}
        </View>

        {/* "Tap for more info..." aligned to bottom right */}
        <View style={styles.moreInfoContainer}>
          <CustomText style={styles.moreInfoText}>
            Tap for more info...
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiet = ({ item }: { item: AssignedDietT }) => {
    if (!item.diet) {
      return null; // or return a placeholder component if needed
    }

    return (
      <TouchableOpacity
        style={styles.dietCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleDietClick(item.diet.id);
        }}
      >
        <View style={styles.dietContent}>
          <CustomText style={styles.dietName}>{item.diet.name}</CustomText>
          <CustomText>Meal type: {item.diet.meal_type}</CustomText>
          <CustomText>Description: {item.diet.description}</CustomText>
          <CustomText>Calories: {item.diet.calories} kcal</CustomText>
        </View>

        {/* "Tap for more info..." aligned to bottom right */}
        <View style={styles.moreInfoContainer}>
          <CustomText style={styles.moreInfoText}>
            Tap for more info...
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      <Header showProfileImage>
        <TouchableOpacity
          onPress={() =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          }
        >
          <LinearGradient
            colors={["#4F46E5", "#feb47b"]}
            start={{ x: 0.9, y: 0.2 }}
            style={styles.upgradeBtn}
          >
            <CustomText style={styles.upgradeText}>Go Premium 🚀</CustomText>
          </LinearGradient>
        </TouchableOpacity>
      </Header>
      <ScrollView
        style={styles.innerContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Streak Progress Bar */}
        <View style={styles.streakContainer}>
          {streak !== null && (
            <CustomText style={[styles.streakText, { color: textColor }]}>
              🔥 {streak} day streak
            </CustomText>
          )}
        </View>

        <View>
          <CustomText style={[styles.streakText, { color: textColor }]}>
            Week {currentWeekNum}
          </CustomText>
        </View>

        {/* Weekly Calendar */}
        <ScrollView
          horizontal
          ref={scrollViewRef}
          contentContainerStyle={styles.calendar}
        >
          {[1, 2, 3, 4, 5, 6, 7].map(renderDayButton)}
        </ScrollView>

        {/* Workouts for Selected Day */}
        <View style={{ marginBottom: 24, marginTop: 12 }}>
          <CustomText style={[styles.sectionTitle, { color: textColor }]}>
            Your Workouts
          </CustomText>
          {itemsForDay && itemsForDay.workouts.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={itemsForDay.workouts}
              renderItem={renderWorkout}
              keyExtractor={(item) => item.workout.id.toString()}
            />
          ) : (
            <CustomText style={{ color: textColor }}>
              No workouts scheduled for this day.
            </CustomText>
          )}
        </View>

        {/* Diets for Selected Day */}
        <CustomText style={[styles.sectionTitle, { color: textColor }]}>
          Your Meals
        </CustomText>
        {itemsForDay && itemsForDay.diets && itemsForDay.diets.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={itemsForDay.diets}
            renderItem={renderDiet}
            keyExtractor={(item, index) =>
              item.diet?.id?.toString() || `day-${item.day}-diet-${index}`
            }
          />
        ) : (
          <CustomText style={{ color: textColor }}>
            No meals scheduled for this day.
          </CustomText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  scrollContent: {
    paddingBottom: 10, // Extra space for the animated view
  },
  innerContainer: {
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "column",
  },
  upgradeBtn: {
    borderRadius: 15,
    padding: 10,
  },
  upgradeText: {
    color: "#000",
    fontFamily: "HostGrotesk-Medium",
  },
  dayInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dietCard: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: "#e5e5e5",
    padding: 15,
    gap: 8,
    marginBottom: 10,
    borderRadius: 15,
  },
  dietName: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
  },
  dietContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    flex: 1,
  },
  moreInfoContainer: {
    alignSelf: "flex-end", // aligns to the right within the card
  },
  moreInfoText: {
    fontSize: 12,
    color: "#4F46E5",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "HostGrotesk-Medium",
    marginVertical: 10,
  },
  borderIndicator: {
    width: 2,
    height: "100%",
    marginRight: 7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: 20,
  },
  calendar: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 10,
  },
  calendarCard: {
    width: CARD_WIDTH,
    height: 200,
    padding: 15,
    borderWidth: 1,
    borderColor: "#c7c7c7",
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "space-between",
  },
  selectedCalendarCard: {
    backgroundColor: "#E6F7E8",
    borderColor: "#4CAF50",
  },
  dayButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  selectedDayButton: {
    backgroundColor: "#4CAF50",
  },
  restDayText: {
    fontSize: 14,
    color: "#A0A0A0",
    fontFamily: "HostGrotesk-LightItalic",
  },
  workoutListContainer: {
    marginVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  workoutName: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    color: "#000",
  },
  workoutDetails: {
    marginTop: 5,
  },
  workoutDuration: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 20,
  },
  workoutCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
  },
  summaryContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  streakText: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  completedText: {
    marginLeft: 8,
    color: "green",
    fontFamily: "HostGrotesk-Medium",
  },
});
