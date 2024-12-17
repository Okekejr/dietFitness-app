export type workoutCardsConfigT = {
  key: string;
  data: WorkoutsT[];
  cardName: string;
  bgImgLink: any;
  cardLink: string;
}[];

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

export const hasMonthPassed = (week_start_date: string) => {
  // Parse the week_start_date to a Date object
  const lastGeneratedDate = new Date(week_start_date);
  // Get the current date
  const currentDate = new Date();
  // Check if a month has passed
  const monthsDifference =
    currentDate.getMonth() -
    lastGeneratedDate.getMonth() +
    12 * (currentDate.getFullYear() - lastGeneratedDate.getFullYear());

  return monthsDifference >= 1; // Return true if a month has passed
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
}

export const distributeWorkoutsAndDietsAcrossWeek = ({
  workoutPlan,
  workoutsPerWeek,
  dietPlan,
  currentWeek,
  pastUsedWorkouts,
}: EvenWorkoutPerWeekT): {
  assignedWorkouts: AssignedWorkoutT[];
  assignedDiets: AssignedDietT[];
} => {
  const assignedWorkouts: AssignedWorkoutT[] = [];
  const assignedDiets: AssignedDietT[] = [];
  const availableDays = [1, 2, 3, 4, 5, 6, 7];
  let lastAssignedDay = -1;

  // Filter out workouts used in past weeks
  const newWorkouts = workoutPlan.filter(
    (workout) =>
      !pastUsedWorkouts.some((usedWorkout) => usedWorkout.id === workout.id)
  );

  // Select workouts for the week
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

  // Assign diets to each workout day with 2 meals per day
  const workoutDays = assignedWorkouts.map(
    (assignedWorkout) => assignedWorkout.day
  );

  workoutDays.forEach((day) => {
    const workoutMeals = [];
    const firstMealIndex = Math.floor(Math.random() * dietPlan.length);
    const firstMeal = dietPlan[firstMealIndex];

    workoutMeals.push(firstMeal);

    // Filter diets to ensure the second meal has a different meal_type
    const filteredDietPlan = dietPlan.filter(
      (diet) => diet.meal_type !== firstMeal.meal_type
    );
    const secondMealIndex = Math.floor(Math.random() * filteredDietPlan.length);
    const secondMeal = filteredDietPlan[secondMealIndex];

    workoutMeals.push(secondMeal);

    workoutMeals.forEach((diet) => {
      assignedDiets.push({
        day: day,
        diet: diet,
        week: currentWeek,
      });
    });
  });

  return { assignedWorkouts, assignedDiets };
};
