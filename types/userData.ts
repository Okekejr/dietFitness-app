import { DietPlanEntity } from "./diet";
import { WorkoutsT } from "./workout";

export interface UserDataT {
  user_id: string;
  name: string;
  email: string;
  weight: number;
  height: number;
  age: number;
  activity_level: string;
  allergies: string;
  preferences: {
    workout: string[];
    diet: string[];
  };
  workout_plan: WorkoutsT[];
  profile_picture?: string;
  current_workout_week: number;
  week_start_date: string;
  streak: number;
  diet_plan: DietPlanEntity[];
}

export interface WorkoutBreakdownT {
  name: string;
  population: string;
  color: string;
  legendFontColor: string;
}

export interface OverviewStatsT {
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
  bestDay: string;
  workoutBreakdown: WorkoutBreakdownT[];
  streak: number;
}
