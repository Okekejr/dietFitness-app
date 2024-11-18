import { API_URL } from "@/constants/apiUrl";
import { AssignedDietT, AssignedWorkoutT, UserDataT, WorkoutsT } from "@/types";
import {
  calculateDaysBetweenDates,
  distributeWorkoutsAndDietsAcrossWeek,
  hasMonthPassed,
  workoutDays,
} from "@/utils";
import { useState } from "react";

interface Props {
  userData: UserDataT | null;
  userId: string;
  refetchUserData: () => void;
}

export const useHomeQueries = ({
  userData,
  userId,
  refetchUserData,
}: Props) => {
  const [schedule, setSchedule] = useState<
    { day: number; workouts: AssignedWorkoutT[]; diets: AssignedDietT[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekNum, setCurrentWeekNum] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Retry mechanism to refetch user data until it loads
  const fetchUserDataWithRetry = async (retryCount = 3) => {
    for (let i = 0; i < retryCount; i++) {
      await refetchUserData();
      if (userData) break;
      await new Promise((resolve) => setTimeout(resolve, 500)); // Add delay between retries
    }
  };

  const fetchWorkoutDetails = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`);
      const data = await response.json();

      // Check if workout is completed
      const completedResponse = await fetch(
        `${API_URL}/api/completedWorkouts?userId=${userId}`
      );

      if (completedResponse.ok) {
        const completedData = await completedResponse.json();

        // Check if the workout ID is in the completed workouts
        const isWorkoutCompleted = completedData.some(
          (workout: WorkoutsT) => workout.id === data.id
        );
        setIsCompleted(isWorkoutCompleted);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching workout details:", error);
      setLoading(false);
    }
  };

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

      setCurrentWeekNum(userData.current_workout_week);

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

  return {
    schedule,
    loading,
    setLoading,
    fetchUserDataWithRetry,
    generateOrFetchWorkoutPlan,
    currentWeekNum,
    fetchWorkoutDetails,
    isCompleted,
  };
};
