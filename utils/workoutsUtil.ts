export const workoutDays = (activityLevel: string): number => {
  // Determine the number of workouts per month based on activity level
  let workoutsPerWeek: number = 0;

  if (activityLevel === "sedentary") workoutsPerWeek = 1;
  else if (activityLevel === "light")
    workoutsPerWeek = 2; // average of 1-3 days/week
  else if (activityLevel === "moderate")
    workoutsPerWeek = 4; // average of 3-5 days/week
  else if (activityLevel === "active") workoutsPerWeek = 6; // 6-7 days/week
  else if (activityLevel === "very-active") workoutsPerWeek = 7;

  return workoutsPerWeek;
};
