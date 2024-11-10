export interface recommendationData {
  workoutPlan?: WorkoutPlanEntity[] | null;
  dietPlan?: DietPlanEntity[] | null;
  workoutData: WorkoutData;
  message: string;
}
export interface WorkoutPlanEntity {
  id: number;
  tag: string;
  name: string;
  duration: number;
  image_url: string;
  intensity: string;
  video_url: string;
  created_at: string;
  category_id: number;
  description: string;
  muscle_gained: number;
  activity_level: string;
  calories_burned: number;
  endurance_improvement: number;
}
export interface DietPlanEntity {
  id: number;
  goal: string;
  name: string;
  calories: number;
  image_url: string;
  meal_time: string;
  meal_type: string;
  created_at: string;
  recipe_url: string;
  description: string;
  ingredients?: string[] | null;
  activity_level: string;
  dietary_restrictions?: string[] | null;
}
export interface WorkoutData {
  workout_plan?: WorkoutPlanEntity[] | null;
  diet_plan?: DietPlanEntity[] | null;
  preferences: Preferences;
  activity_level: string;
}
export interface Preferences {
  diet?: string[] | null;
  workout?: string[] | null;
}
