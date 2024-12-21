import { API_URL } from "@/constants/apiUrl";
import * as AppleAuthentication from "expo-apple-authentication";
import { Alert } from "react-native";

export const handleAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.authorizationCode) {
      throw new Error("Authorization failed.");
    }

    // Send the credential to your backend for validation
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        thirdPartyId: "apple",
        redirectURIInfo: {
          redirectURIOnProviderDashboard: "https://example.com",
          redirectURIQueryParams: {
            code: credential.authorizationCode,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to log in with Apple.");
    }

    // Success - handle user session
    Alert.alert("Login Successful", "You are now logged in.");
  } catch (error) {
    console.error("Apple Sign-In Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error.";
    Alert.alert("Apple Login Failed", errorMessage);
  }
};
