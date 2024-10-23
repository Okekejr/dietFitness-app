import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Fetch streak from the server
        const response = await fetch(
          `${API_URL}/api/user/streak?userId=${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          const { streak: serverStreak, lastActivityDate } = data;

          // Check if the streak needs to be updated
          const lastActivity = new Date(lastActivityDate)
            .toISOString()
            .split("T")[0];

          if (lastActivity !== today) {
            const updateResponse = await fetch(
              `${API_URL}/api/user/updateStreak`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, todayDate: today }),
              }
            );

            const updatedData = await updateResponse.json();
            setStreak(updatedData.streak);

            // Save updated streak to local storage
            await AsyncStorage.setItem(
              "userStreak",
              updatedData.streak.toString()
            );
          } else {
            setStreak(serverStreak);
          }
        }
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    updateStreak();
  }, [userId]);

  let streakNumber = streak.toString();

  return { streak, streakNumber };
};

export default useStreak;
