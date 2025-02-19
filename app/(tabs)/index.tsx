import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUserData } from "@/context/userDataContext";
import { useRouter } from "expo-router";
import { AssignedWorkoutT, AssignedDietT } from "@/types";
import useStreak from "@/hooks/useStreak";
import Header from "@/components/header/header";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";
import { useHomeQueries } from "@/hooks/useHomeQueries";
import { calculateDaysBetweenDates } from "@/utils";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RenderDayButton, daysOfWeek } from "@/components/homeComps/daybutton";

const CARD_WIDTH = 200;

export default function HomeScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    schedule,
    loading,
    setLoading,
    currentWeekNum,
    fetchUserDataWithRetry,
    generateOrFetchWorkoutPlan,
  } = useHomeQueries({ userData, userId, refetchUserData });
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const { streak } = useStreak(userId);

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
      setLoading(false);
    } else {
      fetchUserDataWithRetry();
    }
  }, [userData]);

  useEffect(() => {
    // Load schedule only when userId is ready
    if (userId) {
      refetchUserData();
      generateOrFetchWorkoutPlan();
    }
  }, [userId]);

  useEffect(() => {
    if (schedule.length > 0 && userData?.week_start_date) {
      const daysSinceStart = calculateDaysBetweenDates(
        new Date(userData.week_start_date),
        new Date()
      );

      // Reset to 1 after 7
      const currentDay = (daysSinceStart % 7) + 1;

      setSelectedDay(currentDay);

      // Automatically scroll to the current day's card
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: (currentDay - 1) * CARD_WIDTH,
            animated: true,
          });
        }
      }, 100); // Delay to ensure scroll happens after render
    }
  }, [schedule, userData]);

  const handleDaySelect = (day: number) => setSelectedDay(day);

  const itemsForDay = schedule.find((item) => item.day === selectedDay);

  const handleWorkoutClick = (id: number) => {
    router.push({
      pathname: `/workout/[id]`,
      params: { id: id.toString() },
    });
  };

  const handleDietClick = (id: number) => {
    router.push({
      pathname: `/diet/[id]`,
      params: { id: id.toString() },
    });
  };

  const renderWorkout = ({ item }: { item: AssignedWorkoutT }) => {
    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleWorkoutClick(item.workout.id);
        }}
      >
        <View style={styles.dietContent}>
          <CustomText style={styles.workoutName}>
            {item.workout.name}
          </CustomText>
          <CustomText>Duration: {item.workout.duration} mins</CustomText>
          <CustomText>Description: {item.workout.description}</CustomText>
          <CustomText>Intensity: {item.workout.intensity}</CustomText>
          <CustomText>
            Calories: - {item.workout.calories_burned} kcal
          </CustomText>
        </View>

        {/* "Tap for more info..." aligned to bottom right */}
        <View style={styles.moreInfoContainer}>
          <CustomText style={styles.moreInfoText}>
            Tap for more info...
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiet = ({ item }: { item: AssignedDietT }) => {
    if (!item.diet) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.dietCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleDietClick(item.diet.id);
        }}
      >
        <View style={styles.dietContent}>
          <CustomText style={styles.dietName}>{item.diet.name}</CustomText>
          <CustomText>Meal type: {item.diet.meal_type}</CustomText>
          <CustomText>Description: {item.diet.description}</CustomText>
          <CustomText>Calories: {item.diet.calories} kcal</CustomText>
        </View>

        {/* "Tap for more info..." aligned to bottom right */}
        <View style={styles.moreInfoContainer}>
          <CustomText style={styles.moreInfoText}>
            Tap for more info...
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      <Header showProfileImage>
        <TouchableOpacity
          onPress={() =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          }
        >
          <LinearGradient
            colors={["#4F46E5", "#feb47b"]}
            start={{ x: 0.9, y: 0.2 }}
            style={styles.upgradeBtn}
          >
            <CustomText style={styles.upgradeText}>Go Premium 🚀</CustomText>
          </LinearGradient>
        </TouchableOpacity>
      </Header>
      <ScrollView
        style={styles.innerContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Streak Progress Bar */}
        <View style={styles.streakContainer}>
          {streak !== null && (
            <CustomText style={[styles.streakText, { color: textColor }]}>
              🔥 {streak} day streak
            </CustomText>
          )}
        </View>

        <View>
          <CustomText style={[styles.streakText, { color: textColor }]}>
            Week {currentWeekNum}
          </CustomText>
        </View>

        {/* Weekly Calendar */}
        <ScrollView
          horizontal
          ref={scrollViewRef}
          contentContainerStyle={styles.calendar}
        >
          {daysOfWeek.map((day) => (
            <RenderDayButton
              key={day}
              day={day}
              schedule={schedule}
              handleDaySelect={handleDaySelect}
              selectedDay={selectedDay}
            />
          ))}
        </ScrollView>

        {/* Workouts for Selected Day */}
        <View style={{ marginBottom: 24, marginTop: 12 }}>
          <CustomText style={[styles.sectionTitle, { color: textColor }]}>
            Your Workouts
          </CustomText>
          {itemsForDay && itemsForDay.workouts.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={itemsForDay.workouts}
              renderItem={renderWorkout}
              keyExtractor={(item) => item.workout.id.toString()}
            />
          ) : (
            <CustomText style={{ color: textColor }}>
              No workouts scheduled for this day.
            </CustomText>
          )}
        </View>

        {/* Diets for Selected Day */}
        <CustomText style={[styles.sectionTitle, { color: textColor }]}>
          Your Meals
        </CustomText>
        {itemsForDay && itemsForDay.diets && itemsForDay.diets.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={itemsForDay.diets}
            renderItem={renderDiet}
            keyExtractor={(item, index) =>
              item.diet?.id?.toString() || `day-${item.day}-diet-${index}`
            }
          />
        ) : (
          <CustomText style={{ color: textColor }}>
            No meals scheduled for this day.
          </CustomText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  scrollContent: {
    paddingBottom: 10, // Extra space for the animated view
  },
  innerContainer: {
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "column",
  },
  upgradeBtn: {
    borderRadius: 15,
    padding: 10,
  },
  upgradeText: {
    color: "#000",
    fontFamily: "HostGrotesk-Medium",
  },
  dietCard: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: "#e5e5e5",
    padding: 15,
    gap: 8,
    marginBottom: 10,
    borderRadius: 15,
  },
  dietName: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
  },
  dietContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    flex: 1,
  },
  moreInfoContainer: {
    alignSelf: "flex-end", // aligns to the right within the card
  },
  moreInfoText: {
    fontSize: 12,
    color: "#4F46E5",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "HostGrotesk-Medium",
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: 20,
  },
  calendar: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 10,
  },
  dayButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  selectedDayButton: {
    backgroundColor: "#4CAF50",
  },
  workoutListContainer: {
    marginVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
  },
  workoutName: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    color: "#000",
  },
  workoutDetails: {
    marginTop: 5,
  },
  workoutDuration: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 20,
  },
  workoutCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
  },
  streakText: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  completedText: {
    marginLeft: 8,
    color: "green",
    fontFamily: "HostGrotesk-Medium",
  },
});
