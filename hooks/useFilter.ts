import { Filters, WorkoutsT } from "@/types";
import { useState } from "react";

interface FilterWorkoutT {
  workouts: WorkoutsT[];
}

export const useFilter = ({ workouts }: FilterWorkoutT) => {
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutsT[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    duration: [],
    activityLevel: [],
    intensity: [],
  });

  const applyFilters = (newFilters: Filters) => {
    setFilters(newFilters);

    const countActiveFilters = Object.values(newFilters).reduce(
      (count, filter) => count + filter.length,
      0
    );

    setActiveFilterCount(countActiveFilters);

    const filtered = workouts.filter((workout) => {
      const matchesDuration = newFilters.duration.length
        ? newFilters.duration.some((duration: string) => {
            if (duration === "15-20 mins")
              return workout.duration >= 15 && workout.duration <= 20;
            if (duration === "25-30 mins")
              return workout.duration >= 25 && workout.duration <= 30;
            if (duration === ">30 mins") return workout.duration > 30;
            return false;
          })
        : true;

      const matchesActivity = newFilters.activityLevel.length
        ? newFilters.activityLevel.includes(workout.activity_level)
        : true;

      const matchesIntensity = newFilters.intensity.length
        ? newFilters.intensity.includes(workout.intensity)
        : true;

      return matchesDuration && matchesActivity && matchesIntensity;
    });

    setFilteredWorkouts(filtered);
    setFilterModalVisible(false);
  };

  return {
    filterModalVisible,
    filteredWorkouts,
    activeFilterCount,
    filters,
    applyFilters,
    setFilterModalVisible,
    setFilteredWorkouts,
  };
};
