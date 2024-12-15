import { AssignedDietT, AssignedWorkoutT } from "@/types";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";

const CARD_WIDTH = 200;

export const daysOfWeek = [1, 2, 3, 4, 5, 6, 7];

interface RenderButtonT {
  day: number;
  schedule: {
    day: number;
    workouts: AssignedWorkoutT[];
    diets: AssignedDietT[];
  }[];
  handleDaySelect: (day: number) => void;
  selectedDay: number;
}

export const RenderDayButton = ({
  day,
  schedule,
  handleDaySelect,
  selectedDay,
}: RenderButtonT) => {
  // Find the schedule for the selected day
  const itemsForDay = schedule.find((item) => item.day === day);

  // Check if there's no workout or diet for the day
  const isRestDay =
    !itemsForDay ||
    (itemsForDay.workouts.length === 0 && itemsForDay.diets.length === 0);

  // Count workouts and meals
  const workoutCount = itemsForDay ? itemsForDay.workouts.length : 0;
  const mealCount = itemsForDay ? itemsForDay.diets.length : 0;

  return (
    <TouchableOpacity
      key={day}
      onPress={() => {
        Haptics.selectionAsync();
        handleDaySelect(day);
      }}
      style={[
        styles.calendarCard,
        selectedDay === day && styles.selectedCalendarCard,
      ]}
    >
      <View style={styles.dayInfoContainer}>
        <View
          style={[
            styles.borderIndicator,
            { backgroundColor: day === selectedDay ? "red" : "#E0E0E0" },
          ]}
        />
        <CustomText style={styles.dayText}>Day {day}</CustomText>
      </View>

      {/* Short Info: Display workout and meal counts */}
      {!isRestDay && (
        <View style={styles.summaryContainer}>
          <CustomText style={styles.summaryText}>
            Today:
            {"\n"}• {workoutCount} workout{workoutCount !== 1 && "s"}
            {"\n"}• {mealCount} meal{mealCount !== 1 && "s"}
          </CustomText>
        </View>
      )}

      {/* If no workout or diet for the day */}
      {isRestDay && (
        <CustomText style={styles.restDayText}>Rest day</CustomText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    width: CARD_WIDTH,
    height: 200,
    padding: 15,
    borderWidth: 1,
    borderColor: "#c7c7c7",
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "space-between",
  },
  selectedCalendarCard: {
    backgroundColor: "#24EF7D",
    borderColor: "#4CAF50",
  },
  dayInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  borderIndicator: {
    width: 2,
    height: "100%",
    marginRight: 7,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  restDayText: {
    fontSize: 14,
    color: "#A0A0A0",
    fontFamily: "HostGrotesk-LightItalic",
  },
});
