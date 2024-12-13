import { useEffect, useState } from "react";
import { API_URL } from "@/constants/apiUrl";

const useStreak = (userId: string) => {
  const [streak, setStreak] = useState<number>(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);

  const fetchStreak = async () => {
    if (!userId) return;

    try {
      const currentDate = new Date().toISOString(); // ISO format for backend

      const response = await fetch(`${API_URL}/api/user/updateStreak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, todayDate: currentDate }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setStreak(data.streak); // Update streak from server response
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
