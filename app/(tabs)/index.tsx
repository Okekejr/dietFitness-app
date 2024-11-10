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
  distributeWorkoutsAcrossWeek,
} from "@/utils";
import { ProgressBar } from "react-native-paper";
import { AssignedWorkoutT, WorkoutsT } from "@/types";
import useStreak from "@/hooks/useStreak";
import Header from "@/components/header/header";
import CustomText from "@/components/ui/customText";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState("");
  const [workoutSchedule, setWorkoutSchedule] = useState<AssignedWorkoutT[]>(
    []
  );
  const [selectedDay, setSelectedDay] = useState<number>();
  const [loading, setLoading] = useState(false);
  const { streak, streakNumber } = useStreak(userId);

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
    }
  }, [userData]);

  useEffect(() => {
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

      // Fetch past used workouts from the database
      const pastUsedWorkoutsResponse = await fetch(
        `${API_URL}/api/user/getPastUsedWorkouts?userId=${userId}`
      );

      if (!pastUsedWorkoutsResponse.ok) {
        const errorData = await pastUsedWorkoutsResponse.json();
        console.error("Error fetching past used workouts:", errorData);
        return [];
      }

      const pastUsedWorkouts: WorkoutsT[] =
        await pastUsedWorkoutsResponse.json();

      // Try fetching the workout schedule for the current week
      let workoutScheduleResponse = await fetch(
        `${API_URL}/api/user/getWorkoutSchedule?userId=${userId}`
      );

      if (!workoutScheduleResponse.ok) {
        const errorData = await workoutScheduleResponse.json();
        console.error("Error fetching workout Schedule:", errorData);
        return [];
      }

      let workoutSchedule = await workoutScheduleResponse.json();

      if (workoutSchedule.length === 0) {
        console.log("No workout schedule found for the current week.");
      }

      let currentWorkoutWeek = userData.current_workout_week;

      // Create a new workout schedule if one doesn't exist
      if (!workoutSchedule || workoutSchedule.length === 0) {
        const workoutsPerWeek = workoutDays(userData.activity_level); // Calculate workouts per week
        workoutSchedule = distributeWorkoutsAcrossWeek({
          workoutPlan: userData.workout_plan,
          workoutsPerWeek,
          currentWorkoutWeek,
          pastUsedWorkouts,
        });

        await saveWorkoutSchedule(
          userId,
          workoutSchedule,
          currentWorkoutWeek,
          today
        );
      }

      // If a week has passed, increment the workout week and generate a new schedule
      if (
        daysSinceWeekStart >= 7 &&
        currentWorkoutWeek > userData.current_workout_week
      ) {
        currentWorkoutWeek += 1;
        userData.week_start_date = today.toISOString();

        const newWorkoutSchedule = distributeWorkoutsAcrossWeek({
          workoutPlan: userData.workout_plan,
          workoutsPerWeek: workoutDays(userData.activity_level),
          currentWorkoutWeek,
          pastUsedWorkouts,
        });

        await saveWorkoutSchedule(
          userId,
          newWorkoutSchedule,
          currentWorkoutWeek,
          today
        );
        workoutSchedule = newWorkoutSchedule;
      } else {
        console.log("Already workout for the week:");
      }

      setWorkoutSchedule(workoutSchedule);
    } catch (error) {
      console.error("Error generating or fetching workout plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkoutSchedule = async (
    userId: string,
    schedule: AssignedWorkoutT[],
    weekNumber: number,
    startDate: Date
  ) => {
    try {
      // Save the new workout schedule
      const saveWorkout = await fetch(
        `${API_URL}/api/user/saveWorkoutSchedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            currentWorkoutWeek: weekNumber,
            weekStartDate: startDate.toISOString(),
            workoutSchedule: schedule,
          }),
        }
      );

      if (saveWorkout.ok) {
        // Save the used workouts
        await fetch(`${API_URL}/api/user/saveUsedWorkouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            usedWorkouts: schedule.map((workout) => ({
              workoutId: workout.workout.id,
              weekNumber,
              dateAssigned: startDate.toISOString(),
            })),
          }),
        });
      }
    } catch (error) {
      console.error("Error saving workout schedule:", error);
    }
  };

  const handleDaySelect = (day: number) => setSelectedDay(day);

  const workoutsForDay = workoutSchedule.filter(
    (workout) => workout.day === selectedDay
  );

  const handleWorkoutClick = (id: number) => {
    router.push({
      pathname: `/workout/[id]`,
      params: { id: id.toString() },
    });
  };

  const renderDayButton = (day: number) => (
    <TouchableOpacity
      key={day}
      onPress={() => handleDaySelect(day)}
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

      {/* Filter workouts for this specific day */}
      {workoutSchedule.some((work) => work.day === day) ? (
        workoutSchedule
          .filter((work) => work.day === day)
          .map((work) => (
            <View key={work.workout.id} style={styles.workoutDetails}>
              <CustomText style={styles.workoutName}>
                {work.workout.name}
              </CustomText>
              <CustomText style={styles.workoutDuration}>
                {work.workout.duration} mins
              </CustomText>
            </View>
          ))
      ) : (
        <CustomText style={styles.restDayText}>Rest day</CustomText>
      )}
    </TouchableOpacity>
  );

  const renderWorkout = ({ item }: { item: AssignedWorkoutT }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => handleWorkoutClick(item.workout.id)}
    >
      <CustomText style={styles.workoutName}>{item.workout.name}</CustomText>
      <CustomText>{item.workout.duration} mins</CustomText>
    </TouchableOpacity>
  );

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
        <TouchableOpacity>
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
        <View style={styles.workoutListContainer}>
          <CustomText style={styles.heading}>
            Workouts for Day {selectedDay}
          </CustomText>
          {workoutsForDay.length > 0 ? (
            <FlatList
              data={workoutsForDay}
              scrollEnabled={false}
              keyExtractor={(item) => item.workout.id.toString()}
              renderItem={renderWorkout}
            />
          ) : (
            <CustomText style={styles.emptyText}>
              No workouts assigned for this day.
            </CustomText>
          )}
        </View>
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
  },
  calendarCard: {
    width: 200,
    height: 200,
    marginHorizontal: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: "#c7c7c7",
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    marginBottom: 4,
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
  streakText: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
  },
});
