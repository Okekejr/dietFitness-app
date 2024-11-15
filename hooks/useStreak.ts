import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Fetch the cached streak and last update date
        const cachedStreak = await AsyncStorage.getItem("userStreak");
        const cachedDate = await AsyncStorage.getItem("lastUpdateDate");

        if (cachedDate === today && cachedStreak) {
          setStreak(Number(cachedStreak));
          return;
        }

        // Fetch streak from the server
        const response = await fetch(
          `${API_URL}/api/user/streak?userId=${userId}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const { streak: serverStreak, lastActivityDate } = data;

        // Update streak if needed
        if (lastActivityDate.split("T")[0] !== today) {
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
          await AsyncStorage.setItem(
            "userStreak",
            updatedData.streak.toString()
          );
          await AsyncStorage.setItem("lastUpdateDate", today);
        } else {
          setStreak(serverStreak);
        }
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    if (userId) updateStreak();
  }, [userId]);

  return { streak };
};

export default useStreak;
