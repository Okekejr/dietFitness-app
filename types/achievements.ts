export interface Goal {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface AchievementCardProps {
  goal: Goal;
  unlocked: boolean;
}
