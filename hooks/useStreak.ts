import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const updateStreak = async () => {
      try {
        if (!userId) return;

        const today = new Date().toISOString().split("T")[0];
        const streakKey = `userStreak_${userId}`;
        const dateKey = `lastUpdateDate_${userId}`;

        const cachedStreak = await AsyncStorage.getItem(streakKey);
        const cachedDate = await AsyncStorage.getItem(dateKey);

        // If user already logged in today, return cached streak
        if (cachedDate === today && cachedStreak) {
          setStreak(Number(cachedStreak));
          return;
        }

        // Fetch streak from the backend
        const response = await fetch(
          `${API_URL}/api/user/streak?userId=${userId}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const { streak: serverStreak, lastActivityDate } = data;
        const lastActivityDay = lastActivityDate.split("T")[0];

        const dayDifference = Math.floor(
          (new Date(today).getTime() - new Date(lastActivityDay).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (dayDifference === 1) {
          // Increment streak if it's the next calendar day
          const newStreak = serverStreak + 1;
          setStreak(newStreak);
          await AsyncStorage.setItem(streakKey, newStreak.toString());
        } else if (dayDifference > 1) {
          // Reset streak if more than 1 day has passed
          setStreak(0);
          await AsyncStorage.setItem(streakKey, "0");
        } else {
          // If same day or invalid difference, keep server streak
          setStreak(serverStreak);
          await AsyncStorage.setItem(streakKey, serverStreak.toString());
        }

        await AsyncStorage.setItem(dateKey, today);
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    updateStreak();
  }, [userId]);

  return { streak };
};

export default useStreak;
