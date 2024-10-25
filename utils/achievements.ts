import { API_URL } from "@/constants/apiUrl";
import { OverviewStatsT } from "@/types";

export const ACHIEVEMENTS = [
  {
    id: "beginner",
    name: "Beginner",
    description: "Complete 1 workout",
    icon: "checkmark-circle",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 1,
  },
  {
    id: "committed",
    name: "Committed",
    description: "Complete 10 workouts",
    icon: "checkmark-done",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 10,
  },
  {
    id: "champion",
    name: "Champion",
    description: "Complete 50 workouts",
    icon: "trophy",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 50,
  },
];

export const MILESTONES = [
  {
    id: "calorie_100",
    name: "100 Calories",
    description: "Burn 100 calories",
    icon: "flame",
    condition: (stats: OverviewStatsT) => stats.totalCalories >= 100,
  },
  {
    id: "calorie_1000",
    name: "1000 Calories",
    description: "Burn 1000 calories",
    icon: "fitness",
    condition: (stats: OverviewStatsT) => stats.totalCalories >= 1000,
  },
  {
    id: "minutes_5000",
    name: "5000 Minutes",
    description: "Work out for 5000 minutes",
    icon: "timer",
    condition: (stats: OverviewStatsT) => stats.totalMinutes >= 5000,
  },
];

// export const STREAKS = [
//   {
//     id: "streak_3",
//     name: "3-Day Streak",
//     description: "Workout 3 days in a row",
//     icon: "calendar",
//     condition: (stats) => stats.streak >= 3,
//   },
//   {
//     id: "streak_7",
//     name: "7-Day Streak",
//     description: "Workout 7 days in a row",
//     icon: "calendar-outline",
//     condition: (stats) => stats.streak >= 7,
//   },
//   {
//     id: "streak_30",
//     name: "30-Day Streak",
//     description: "Workout 30 days in a row",
//     icon: "calendar-sharp",
//     condition: (stats) => stats.streak >= 30,
//   },
// ];

interface trackAchievementsT {
  stats: OverviewStatsT;
  userId: string;
}

export const trackAchievements = async ({
  stats,
  userId,
}: trackAchievementsT) => {
  const allGoals = [...ACHIEVEMENTS, ...MILESTONES];

  for (const goal of allGoals) {
    if (goal.condition(stats)) {
      try {
        await fetch(`${API_URL}/api/achievements/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, achievementId: goal.id }),
        });
      } catch (error) {
        console.error("Error saving achievement:", error);
      }
    }
  }
};
