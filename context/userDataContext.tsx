import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/apiUrl";
import { useRouter } from "expo-router";
import { UserDataT } from "@/types";

interface UserDataContextT {
  userData: UserDataT | null;
  loading: boolean;
  refetchUserData: () => void;
}

const UserDataContext = createContext<UserDataContextT | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDataT | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("accessToken");
      if (!userId) {
        router.replace("/login");
        return;
      }
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const refetchUserData = () => fetchUserData();

  return (
    <UserDataContext.Provider value={{ userData, loading, refetchUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
