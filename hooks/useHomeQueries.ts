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

  // Retry mechanism to refetch user data until it loads
  const fetchUserDataWithRetry = async (retryCount = 3) => {
    for (let i = 0; i < retryCount; i++) {
      await refetchUserData();
      if (userData) break;
      await new Promise((resolve) => setTimeout(resolve, 500)); // Add delay between retries
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

      let currentWeek = userData.current_workout_week;

      console.log(currentWeekNum, daysSinceWeekStart);

      setCurrentWeekNum(userData.current_workout_week);

      if (hasMonthPassed(userData.week_start_date)) {
        console.log("A month has passed since the last plan, regenerating...");
        // Regenerate workout and diet plan
        const regenerateResponse = await fetch(
          `${API_URL}/api/users/userData/regeneratePlan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Ensure session/cookies are sent
          }
        );

        if (!regenerateResponse.ok) {
          const errorData = await regenerateResponse.json();
          console.error("Error regenerating plan:", errorData);
          setLoading(false);
          return;
        }

        const { workouts, meals } = await regenerateResponse.json();

        // Update userData with the new plans
        userData.workout_plan = workouts;
        userData.diet_plan = meals;
        userData.week_start_date = today.toISOString(); // Reset the month start date
        userData.current_workout_week = 1; // Reset to week 1

        // Delete past used workouts
        const deletePastUsedWorkoutResponse = await fetch(
          `${API_URL}/api/user/deleteUsedWorkouts?userId=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (!deletePastUsedWorkoutResponse.ok) {
          const errorData = await deletePastUsedWorkoutResponse.json();
          console.error("Error deleting past used workouts:", errorData);
          return;
        }

        // Set pastUsedWorkouts as an empty array
        const pastUsedWorkouts: WorkoutsT[] = [];

        // Distribute the workouts and diets across the week
        const workoutsPerWeek = workoutDays(userData.activity_level);
        const { assignedWorkouts, assignedDiets } =
          distributeWorkoutsAndDietsAcrossWeek({
            workoutPlan: userData.workout_plan,
            dietPlan: userData.diet_plan,
            workoutsPerWeek,
            currentWeek: userData.current_workout_week,
            pastUsedWorkouts,
          });

        // Generate the new weekly schedule
        const weeklySchedule = Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          workouts: assignedWorkouts.filter((w) => w.day === i + 1),
          diets: assignedDiets.filter((d) => d.day === i + 1),
        }));

        // Save the new schedule
        await saveSchedule(
          userId,
          weeklySchedule,
          userData.current_workout_week,
          today
        );

        // Set the fetched or newly generated schedule
        setSchedule(weeklySchedule);
      } else {
        console.log("A month hasn't passed yet.");
      }

      const adjustedDay = ((daysSinceWeekStart - 1) % 7) + 1;

      console.log(adjustedDay);

      if (adjustedDay === 1 && daysSinceWeekStart > 7) {
        console.log("Starting a new week...");
        currentWeek += 1; // Increment the week number
        userData.current_workout_week = currentWeek;
        userData.week_start_date = today.toISOString(); // Reset the start date for the new week

        const pastUsedWorkoutsResponse = await fetch(
          `${API_URL}/api/user/getPastUsedWorkouts?userId=${userId}`
        );

        const pastUsedWorkouts: WorkoutsT[] = pastUsedWorkoutsResponse.ok
          ? await pastUsedWorkoutsResponse.json()
          : [];

        // Generate a new weekly schedule
        const workoutsPerWeek = workoutDays(userData.activity_level);
        const { assignedWorkouts, assignedDiets } =
          distributeWorkoutsAndDietsAcrossWeek({
            workoutPlan: userData.workout_plan,
            dietPlan: userData.diet_plan,
            workoutsPerWeek,
            currentWeek,
            pastUsedWorkouts,
          });

        const newWeeklySchedule = Array.from({ length: 7 }, (_, i) => ({
          day: (daysSinceWeekStart % 7) + i + 1, // Reset days to 1–7
          workouts: assignedWorkouts.filter((w) => w.day === i + 1),
          diets: assignedDiets.filter((d) => d.day === i + 1),
        }));

        // Save the new schedule to the backend
        await saveSchedule(userId, newWeeklySchedule, currentWeek, today);

        // Update the local state
        setSchedule(newWeeklySchedule);
        setCurrentWeekNum(currentWeek);
      }

      // Fetch and set the current schedule if it exists
      let scheduleResponse = await fetch(
        `${API_URL}/api/user/getSchedule?userId=${userId}`
      );

      let weeklySchedule = scheduleResponse.ok
        ? await scheduleResponse.json()
        : [];

      if (!weeklySchedule || weeklySchedule.length === 0) {
        // Generate and save a new schedule if it doesn't exist
        const workoutsPerWeek = workoutDays(userData.activity_level);
        const { assignedWorkouts, assignedDiets } =
          distributeWorkoutsAndDietsAcrossWeek({
            workoutPlan: userData.workout_plan,
            dietPlan: userData.diet_plan,
            workoutsPerWeek,
            currentWeek,
            pastUsedWorkouts: [],
          });

        weeklySchedule = Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          workouts: assignedWorkouts.filter((w) => w.day === i + 1),
          diets: assignedDiets.filter((d) => d.day === i + 1),
        }));

        await saveSchedule(userId, weeklySchedule, currentWeek, today);
      }

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
  };
};
