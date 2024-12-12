import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);

  const fetchStreak = async () => {
    if (!userId) return;

    try {
      const currentDate = new Date();
      const response = await fetch(
        `${API_URL}/api/user/streak?userId=${userId}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      const { streak: serverStreak, lastActivityDate } = data;
      const lastActivity = new Date(lastActivityDate);
      const timeDifference = currentDate.getTime() - lastActivity.getTime();

      // Calculate the difference in full days
      const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

      if (dayDifference >= 2) {
        // User missed a day; reset the streak
        const resetResponse = await fetch(`${API_URL}/api/user/resetStreak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const resetData = await resetResponse.json();

        if (!resetResponse.ok) throw new Error(resetData.error);

        setStreak(1); // Reset streak to 0
      } else if (dayDifference >= 1) {
        // Update streak for a new day
        const updateResponse = await fetch(`${API_URL}/api/user/updateStreak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const updatedData = await updateResponse.json();

        if (!updateResponse.ok) throw new Error(updatedData.error);

        setStreak(updatedData.streak); // Update streak from server
      } else {
        // No update needed, just set the current streak
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
