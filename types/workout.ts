export interface WorkoutsT {
  workout_id: any;
  id: number;
  name: string;
  category_id: number;
  video_url: string;
  duration: number;
  description: string;
  intensity: string;
  muscle_gained: number;
  endurance_improvement: number;
  calories_burned: number;
  created_at: Date;
  tag: string;
  activity_level: string;
  image_url: string;
  isFavorite?: boolean;
}

export interface WorkoutsFav {
  id: number;
  name: string;
  category_id: number;
  video_url: string;
  duration: number;
  intensity: string;
  muscle_gained: number;
  endurance_improvement: number;
  calories_burned: number;
  created_at: Date;
  tag: string;
  activity_level: string;
  image_url: string;
  isFavorite: boolean;
}

export interface AssignedWorkoutT {
  day: number; // Represents the day of the week (1 for Monday, 7 for Sunday)
  workout: WorkoutsT;
  week: number; // The week number this workout is assigned for
}

export interface CompletedWorkout {
  name: string;
  intensity: string;
  image_url: string;
  duration: number;
  activity_level: string;
  workout_id: number;
  tag: string;
  completed_at: string;
}
