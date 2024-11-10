import { AssignedWorkoutT, WorkoutsT } from "@/types";

export const workoutDays = (activityLevel: string): number => {
  // Determine the number of workouts per month based on activity level
  let workoutsPerWeek: number = 0;

  if (activityLevel === "sedentary") workoutsPerWeek = 1;
  else if (activityLevel === "light") workoutsPerWeek = 2;
  else if (activityLevel === "moderate") workoutsPerWeek = 4;
  else if (activityLevel === "active") workoutsPerWeek = 6;
  else if (activityLevel === "very-active") workoutsPerWeek = 7;

  return workoutsPerWeek;
};

export const calculateDaysBetweenDates = (
  startDate: Date,
  endDate: Date
): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

interface EvenWorkoutPerWeekT {
  workoutPlan: WorkoutsT[];
  workoutsPerWeek: number;
  currentWorkoutWeek: number; // Add currentWorkoutWeek as an input parameter
  pastUsedWorkouts: WorkoutsT[]; // Add pastUsedWorkouts to exclude from the new week
}

export const distributeWorkoutsAcrossWeek = ({
  workoutPlan,
  workoutsPerWeek,
  currentWorkoutWeek,
  pastUsedWorkouts,
}: EvenWorkoutPerWeekT): AssignedWorkoutT[] => {
  const assignedWorkouts: AssignedWorkoutT[] = [];
  const availableDays = [1, 2, 3, 4, 5, 6, 7]; // Representing Day 1 to Day 7
  let lastAssignedDay = -1; // Initialize to an invalid day to start

  // Filter out workouts that were used in past weeks to get only the new ones
  const newWorkouts = workoutPlan.filter(
    (workout) =>
      !pastUsedWorkouts.some((usedWorkout) => usedWorkout.id === workout.id)
  );

  // If there are not enough new workouts to cover the week, recycle the remaining workouts
  const workoutsToUse =
    newWorkouts.length >= workoutsPerWeek
      ? newWorkouts.slice(0, workoutsPerWeek)
      : [
          ...newWorkouts,
          ...workoutPlan.slice(0, workoutsPerWeek - newWorkouts.length),
        ];

  // Distribute workouts randomly across the available days
  workoutsToUse.forEach((workout) => {
    // Filter available days to avoid assigning workouts on consecutive days
    const nonConsecutiveDays = availableDays.filter(
      (day) => Math.abs(day - lastAssignedDay) > 1
    );
    const possibleDays =
      nonConsecutiveDays.length > 0 ? nonConsecutiveDays : availableDays;

    // Randomly pick a day from the possible days
    const randomDayIndex = Math.floor(Math.random() * possibleDays.length);
    const selectedDay = possibleDays[randomDayIndex];

    // Remove the selected day from availableDays to prevent it from being used again
    availableDays.splice(availableDays.indexOf(selectedDay), 1);
    lastAssignedDay = selectedDay; // Update lastAssignedDay to the day we just assigned

    // Assign the workout to the selected day
    assignedWorkouts.push({
      day: selectedDay,
      workout: workout,
      week: currentWorkoutWeek,
    });
  });

  return assignedWorkouts;
};
