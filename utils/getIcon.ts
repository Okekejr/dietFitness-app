import { WorkoutsT } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";

export const getIconName = (
  routeName: string,
  focused: boolean
): keyof typeof Ionicons.glyphMap => {
  switch (routeName) {
    case "index":
      return focused ? "home" : "home-outline";
    case "workouts":
      return focused ? "flame" : "flame-outline";
    case "summary":
      return focused ? "fitness" : "fitness-outline";
    case "runClub":
      return focused ? "people-circle" : "people-circle-outline";
    default:
      return "help"; // Fallback icon
  }
};

export interface workoutInfoT {
  duration?: WorkoutsT["duration"];
  tag?: WorkoutsT["tag"];
  intensity?: WorkoutsT["intensity"];
  calories_burned?: WorkoutsT["calories_burned"];
}

export const getWorkoutPageIcons = (workoutInfo: workoutInfoT) => {
  if (workoutInfo.calories_burned) return "flame";
  if (workoutInfo.duration) return "timer";
  if (workoutInfo.tag) return "walk";

  switch (workoutInfo.intensity) {
    case "Low":
      return "leaf";
    case "Medium":
      return "flash";
    case "High":
      return "barbell";
    default:
      return "help-circle-outline";
  }
};

export const getTabTitle = (routeName: string) => {
  switch (routeName) {
    case "index":
      return "Home";
    case "workouts":
      return "Workouts";
    case "summary":
      return "Summary";
    case "runClub":
      return "Run Club";
    default:
      return "Tab";
  }
};

export const measurement = (data: string) => {
  switch (data) {
    case "age":
      return "yrs";
    case "weight":
      return "kg";
    case "height":
      return "cm";
    default:
      return "";
  }
};

export const getTagColor = (tag: string) => {
  switch (tag) {
    case "Strength":
      return "#4CAF50";
    case "Cardio":
      return "#FF6347";
    case "HIIT":
      return "#FFD700";
    case "Core":
      return "#00BFFF";
    case "Endurance":
      return "#FF69B4";
    default:
      return "#808080";
  }
};
