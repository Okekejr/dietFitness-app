import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const updateStreak = async () => {
      try {
        if (!userId) return;

        const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

        // Use user-specific keys for AsyncStorage
        const streakKey = `userStreak_${userId}`;
        const dateKey = `lastUpdateDate_${userId}`;

        // Fetch cached streak and last update date
        const cachedStreak = await AsyncStorage.getItem(streakKey);
        const cachedDate = await AsyncStorage.getItem(dateKey);

        if (cachedDate === today && cachedStreak) {
          setStreak(Number(cachedStreak));
          return;
        }

        // Fetch streak from server
        const response = await fetch(
          `${API_URL}/api/user/streak?userId=${userId}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const { streak: serverStreak, lastActivityDate } = data;

        if (lastActivityDate.split("T")[0] !== today) {
          // Update streak on the server
          const updateResponse = await fetch(
            `${API_URL}/api/user/updateStreak`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, todayDate: today }),
            }
          );

          const updatedData = await updateResponse.json();
          if (!updateResponse.ok) throw new Error(updatedData.error);

          setStreak(updatedData.streak);

          // Cache the updated streak and date
          await AsyncStorage.setItem(streakKey, updatedData.streak.toString());
          await AsyncStorage.setItem(dateKey, today);
        } else {
          setStreak(serverStreak);

          // Cache the fetched streak and date
          await AsyncStorage.setItem(streakKey, serverStreak.toString());
          await AsyncStorage.setItem(dateKey, today);
        }
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    updateStreak();
  }, [userId]);

  return { streak };
};

export default useStreak;
