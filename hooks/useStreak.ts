import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);

  const fetchStreak = async () => {
    if (!userId) return;

    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${API_URL}/api/user/streak?userId=${userId}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      const { streak: serverStreak, lastActivityDate } = data;

      // Update streak if necessary
      const dayDifference = Math.floor(
        (new Date(todayDate).getTime() - new Date(lastActivityDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (dayDifference >= 1) {
        // Update streak on the server
        const updateResponse = await fetch(`${API_URL}/api/user/updateStreak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, todayDate }),
        });
        const updatedData = await updateResponse.json();

        if (!updateResponse.ok) throw new Error(updatedData.error);

        setStreak(updatedData.streak);
      } else {
        setStreak(serverStreak);
      }
    } catch (error) {
      console.error("Error fetching or updating streak:", error);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [userId]);

  return { streak };
};

export default useStreak;
