import React, { useEffect, useState } from "react";
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
import { API_URL } from "@/constants/apiUrl";
import {
  calculateDaysBetweenDates,
  workoutDays,
  distributeWorkoutsAndDietsAcrossWeek,
  hasMonthPassed,
} from "@/utils";
import {
  AssignedWorkoutT,
  AssignedDietT,
  WorkoutsT,
  DietPlanEntity,
} from "@/types";
import useStreak from "@/hooks/useStreak";
import Header from "@/components/header/header";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState("");
  const [schedule, setSchedule] = useState<
    { day: number; workouts: AssignedWorkoutT[]; diets: AssignedDietT[] }[]
  >([]);
  const [selectedDay, setSelectedDay] = useState<number>();
  const [loading, setLoading] = useState(true);
  const { streak, streakNumber } = useStreak(userId);

  // Retry mechanism to refetch user data until it loads
  const fetchUserDataWithRetry = async (retryCount = 3) => {
    for (let i = 0; i < retryCount; i++) {
      await refetchUserData();
      if (userData) break;
      await new Promise((resolve) => setTimeout(resolve, 500)); // Add delay between retries
    }
  };

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
      setLoading(false);
    } else {
      fetchUserDataWithRetry(); // Retry loading userData if undefined
    }
  }, [userData]);

  useEffect(() => {
    // Load schedule only when userId is ready
    if (userId) {
      refetchUserData();
      generateOrFetchWorkoutPlan();
    }
  }, [userId]);

  const generateOrFetchWorkoutPlan = async () => {
    if (!userId || !userData) return;

    try {
      setLoading(true);
      const today = new Date();
      const formattedWeekStartDate = userData.week_start_date
        ? new Date(userData.week_start_date).toISOString()
        : today.toISOString();

      const daysSinceWeekStart = calculateDaysBetweenDates(
        new Date(formattedWeekStartDate),
        today
      );

      if (hasMonthPassed(userData.week_start_date)) {
        // Make API request here since a month has passed
        console.log(
          "A month has passed since the last plan, make the request."
        );
      } else {
        console.log("A month hasn't passed yet.");
      }

      // Fetch past used workouts and diets from the database
      const pastUsedWorkoutsResponse = await fetch(
        `${API_URL}/api/user/getPastUsedWorkouts?userId=${userId}`
      );

      if (!pastUsedWorkoutsResponse.ok) {
        const errorData = await pastUsedWorkoutsResponse.json();
        console.error("Error fetching past data:", errorData);
        return [];
      }

      const pastUsedWorkouts: WorkoutsT[] = pastUsedWorkoutsResponse.ok
        ? await pastUsedWorkoutsResponse.json()
        : [];

      // Fetch schedule for the current week
      let scheduleResponse = await fetch(
        `${API_URL}/api/user/getSchedule?userId=${userId}`
      );

      let weeklySchedule = scheduleResponse.ok
        ? await scheduleResponse.json()
        : [];

      let currentWeek = userData.current_workout_week;

      // Check if no schedule exists
      if (!weeklySchedule || weeklySchedule.length === 0) {
        // If schedule is empty, generate a new one
        const workoutsPerWeek = workoutDays(userData.activity_level);
        const { assignedWorkouts, assignedDiets } =
          distributeWorkoutsAndDietsAcrossWeek({
            workoutPlan: userData.workout_plan,
            dietPlan: userData.diet_plan,
            workoutsPerWeek,
            currentWeek,
            pastUsedWorkouts,
          });

        // Generate the new weekly schedule
        weeklySchedule = Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          workouts: assignedWorkouts.filter((w) => w.day === i + 1),
          diets: assignedDiets.filter((d) => d.day === i + 1),
        }));

        // Save the new schedule
        await saveSchedule(userId, weeklySchedule, currentWeek, today);
      }

      if (
        daysSinceWeekStart >= 7 &&
        currentWeek > userData.current_workout_week
      ) {
        currentWeek += 1; // Increment the current week number
        userData.week_start_date = today.toISOString();

        const workoutsPerWeek = workoutDays(userData.activity_level);
        const { assignedWorkouts, assignedDiets } =
          distributeWorkoutsAndDietsAcrossWeek({
            workoutPlan: userData.workout_plan,
            dietPlan: userData.diet_plan,
            workoutsPerWeek,
            currentWeek,
            pastUsedWorkouts,
          });

        // Generate the new weekly schedule
        weeklySchedule = Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          workouts: assignedWorkouts.filter((w) => w.day === i + 1),
          diets: assignedDiets.filter((d) => d.day === i + 1),
        }));

        // Save the new schedule
        await saveSchedule(userId, weeklySchedule, currentWeek, today);
      }

      // Set the fetched or newly generated schedule
      setSchedule(weeklySchedule);
    } catch (error) {
      console.error("Error generating or fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (
    userId: string,
    schedule: {
      day: number;
      workouts: AssignedWorkoutT[];
      diets: AssignedDietT[];
    }[],
    weekNumber: number,
    startDate: Date
  ) => {
    try {
      // Save the full schedule (workouts + diets)
      const saveScheduleResponse = await fetch(
        `${API_URL}/api/user/saveSchedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            currentWeek: weekNumber,
            weekStartDate: startDate.toISOString(),
            schedule,
          }),
        }
      );

      if (saveScheduleResponse.ok) {
        // Save the used workouts after the schedule is saved
        await fetch(`${API_URL}/api/user/saveUsedWorkouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            usedWorkouts: schedule.flatMap((day) =>
              day.workouts.map((workout) => ({
                workoutId: workout.workout.id,
                weekNumber,
                dateAssigned: startDate.toISOString(),
              }))
            ),
          }),
        });
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

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
          <CustomText style={styles.dayText}>
            Day {day} {isRestDay ? "- Rest Day" : ""}
          </CustomText>
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

  const renderWorkout = ({ item }: { item: AssignedWorkoutT }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleWorkoutClick(item.workout.id);
      }}
    >
      <View style={styles.dietContent}>
        <CustomText style={styles.workoutName}>{item.workout.name}</CustomText>
        <CustomText>Duration: {item.workout.duration} mins</CustomText>
        <CustomText>Description: {item.workout.description}</CustomText>
        <CustomText>Intensity: {item.workout.intensity}</CustomText>
      </View>

      {/* "Tap for more info..." aligned to bottom right */}
      <View style={styles.moreInfoContainer}>
        <CustomText style={styles.moreInfoText}>
          Tap for more info...
        </CustomText>
      </View>
    </TouchableOpacity>
  );

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
    <SafeAreaView style={styles.container}>
      <Header>
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
      <ScrollView style={styles.innerContainer}>
        {/* Streak Progress Bar */}
        <View style={styles.streakContainer}>
          {streakNumber && (
            <CustomText style={styles.streakText}>
              🔥 {streakNumber} day streak
            </CustomText>
          )}
        </View>

        {/* Weekly Calendar */}
        <ScrollView horizontal contentContainerStyle={styles.calendar}>
          {[1, 2, 3, 4, 5, 6, 7].map(renderDayButton)}
        </ScrollView>

        {/* Workouts for Selected Day */}
        <View style={{ marginBottom: 24, marginTop: 12 }}>
          <CustomText style={styles.sectionTitle}>Your Workouts</CustomText>
          {itemsForDay && itemsForDay.workouts.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={itemsForDay.workouts}
              renderItem={renderWorkout}
              keyExtractor={(item) => item.workout.id.toString()}
            />
          ) : (
            <CustomText>No workouts scheduled for this day.</CustomText>
          )}
        </View>

        {/* Diets for Selected Day */}
        <CustomText style={styles.sectionTitle}>Your Meals</CustomText>
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
          <CustomText>No meals scheduled for this day.</CustomText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  innerContainer: {
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "column",
  },
  upgradeBtn: {
    borderRadius: 10,
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
    borderRadius: 10,
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
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    color: "red",
  },
  calendar: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 10,
  },
  calendarCard: {
    width: 200,
    height: 200,
    padding: 15,
    borderWidth: 1,
    borderColor: "#c7c7c7",
    borderRadius: 10,
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
    borderRadius: 8,
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
});
