import { WorkoutsT } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export const getIconName = (
  routeName: string,
  focused: boolean
): keyof typeof Ionicons.glyphMap => {
  switch (routeName) {
    case "index":
      return focused ? "home" : "home-outline";
    case "workouts":
      return focused ? "barbell" : "barbell-outline";
    case "activity":
      return focused ? "fitness" : "fitness-outline";
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
