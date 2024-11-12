import {
  AssignedWorkoutT,
  AssignedDietT,
  WorkoutsT,
  DietPlanEntity,
} from "@/types";

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
  dietPlan: DietPlanEntity[];
  workoutsPerWeek: number;
  currentWeek: number;
  pastUsedWorkouts: WorkoutsT[];
  pastUsedDiets: DietPlanEntity[];
}

export const distributeWorkoutsAndDietsAcrossWeek = ({
  workoutPlan,
  workoutsPerWeek,
  dietPlan,
  currentWeek,
  pastUsedWorkouts,
  pastUsedDiets, // Include pastUsedDiets
}: EvenWorkoutPerWeekT): {
  assignedWorkouts: AssignedWorkoutT[];
  assignedDiets: AssignedDietT[];
} => {
  const assignedWorkouts: AssignedWorkoutT[] = [];
  const assignedDiets: AssignedDietT[] = [];
  const availableDays = [1, 2, 3, 4, 5, 6, 7];
  let lastAssignedDay = -1;

  // Filter out workouts and diets used in past weeks
  const newWorkouts = workoutPlan.filter(
    (workout) =>
      !pastUsedWorkouts.some((usedWorkout) => usedWorkout.id === workout.id)
  );
  const newDiets = dietPlan.filter(
    (diet) => !pastUsedDiets.some((usedDiet) => usedDiet.id === diet.id)
  );

  // Select workouts
  const workoutsToUse =
    newWorkouts.length >= workoutsPerWeek
      ? newWorkouts.slice(0, workoutsPerWeek)
      : [
          ...newWorkouts,
          ...workoutPlan.slice(0, workoutsPerWeek - newWorkouts.length),
        ];

  workoutsToUse.forEach((workout) => {
    const nonConsecutiveDays = availableDays.filter(
      (day) => Math.abs(day - lastAssignedDay) > 1
    );
    const possibleDays =
      nonConsecutiveDays.length > 0 ? nonConsecutiveDays : availableDays;

    const randomDayIndex = Math.floor(Math.random() * possibleDays.length);
    const selectedDay = possibleDays[randomDayIndex];

    availableDays.splice(availableDays.indexOf(selectedDay), 1);
    lastAssignedDay = selectedDay;

    assignedWorkouts.push({
      day: selectedDay,
      workout: workout,
      week: currentWeek,
    });
  });

  // Assign diets to each day of the week, avoiding past-used diets
  availableDays.forEach((day) => {
    const randomDietIndex = Math.floor(Math.random() * newDiets.length);
    const selectedDiet = newDiets[randomDietIndex];

    assignedDiets.push({
      day: day,
      diet: selectedDiet,
      week: currentWeek,
    });
  });

  return { assignedWorkouts, assignedDiets };
};
