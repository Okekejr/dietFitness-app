import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { API_URL } from "@/constants/apiUrl";

export const handleLogin = async (
  email: string,
  password: string
): Promise<void> => {
  if (!email || !password) {
    Alert.alert("Error", "Please provide email and password.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
      body: JSON.stringify({
        formFields: [
          { id: "email", value: email },
          { id: "password", value: password },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || "Invalid email or password. Please try again.";
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const userId = data?.user?.id;
    console.log("User ID:", userId);

    if (!userId) {
      throw new Error("User not found. Please sign up.");
    }

    await AsyncStorage.setItem("accessToken", userId);

    const storedToken = await AsyncStorage.getItem("accessToken");
    console.log("Stored access token:", storedToken);

    if (storedToken) {
      Alert.alert("Login Successful");
    } else {
      throw new Error("Failed to store access token.");
    }
  } catch (error) {
    console.error("Login Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error.";
    Alert.alert("Login Failed", errorMessage);
  }
};
