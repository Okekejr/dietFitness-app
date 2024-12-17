import { API_URL } from "@/constants/apiUrl";
import { OverviewStatsT } from "@/types";
import { Ionicons } from "@expo/vector-icons";

export type AchievementsTypeT = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap | string;
  condition: (stats: OverviewStatsT) => boolean;
}[];

export interface AchievementItems {
  item: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
}

export const ACHIEVEMENTS: AchievementsTypeT = [
  {
    id: "beginner",
    name: "Beginner",
    description: "1 workout",
    icon: "checkmark-circle",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 1,
  },
  {
    id: "moves",
    name: "Making Moves",
    description: "5 workouts",
    icon: "trending-up",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 5,
  },
  {
    id: "committed",
    name: "Committed",
    description: "10 workouts",
    icon: "checkmark-done",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 10,
  },
  {
    id: "keep going",
    name: "Keep going",
    description: "15 workouts",
    icon: "checkmark-done",
    condition: (stats: OverviewStatsT) => stats.totalWorkouts >= 15,
  },
  {
    id: "champion",
    name: "Champion",
    description: "50 workouts",
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
    description: "5000 minutes",
    icon: "timer",
    condition: (stats: OverviewStatsT) => stats.totalMinutes >= 5000,
  },
];

export const STREAKS = [
  {
    id: "streak_3",
    name: "Three-Day Warrior",
    description: "3 days in a row",
    icon: "calendar",
    condition: (stats: OverviewStatsT) => stats.streak >= 3,
  },
  {
    id: "streak_5",
    name: "5-Day Streak",
    description: "5 days in a row",
    icon: "calendar",
    condition: (stats: OverviewStatsT) => stats.streak >= 5,
  },
  {
    id: "streak_7",
    name: "One-Week Streak",
    description: "7 days in a row",
    icon: "calendar-outline",
    condition: (stats: OverviewStatsT) => stats.streak >= 7,
  },
  {
    id: "streak_30",
    name: "Consistency Champion",
    description: "30 days in a row",
    icon: "calendar-sharp",
    condition: (stats: OverviewStatsT) => stats.streak >= 30,
  },
];

interface trackAchievementsT {
  stats: OverviewStatsT;
  userId: string;
}

export const trackAchievements = async ({
  stats,
  userId,
}: trackAchievementsT) => {
  const allGoals = [...ACHIEVEMENTS, ...MILESTONES, ...STREAKS];

  // Fetch already unlocked achievements
  const unlockedAchievements = await fetch(
    `${API_URL}/api/achievements/${userId}`
  )
    .then((res) => res.json())
    .catch(() => []);

  for (const goal of allGoals) {
    if (goal.condition(stats) && !unlockedAchievements.includes(goal.id)) {
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
