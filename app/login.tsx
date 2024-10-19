import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/apiUrl";

// Open the browser session correctly (required for standalone apps)
WebBrowser.maybeCompleteAuthSession();

// Define provider types
type OAuthProvider = "google" | "github";

// Define discovery documents for providers
const discovery: Record<OAuthProvider, AuthSession.DiscoveryDocument> = {
  google: {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  },
  github: {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
  },
};

// Client IDs for OAuth providers
const clientIds: Record<OAuthProvider, string> = {
  google: "your-google-client-id",
  github: "your-github-client-id",
};

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "myapp",
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const router = useRouter();

  // Helper function to check if the user exists
  const checkIfUserExists = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}`);
      const userExists = response.status === 200; // User found

      if (userExists) {
        router.replace("/(tabs)/"); // Redirect to home
      } else {
        router.replace("/personalInfo"); // Start onboarding
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      Alert.alert("Error", "Unable to verify user. Please try again.");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error("User data not found. Please try again.");
      }

      // Save the user ID or access token
      await AsyncStorage.setItem("accessToken", userId);

      // Fetch the stored token to confirm it was saved
      const storedToken = await AsyncStorage.getItem("accessToken");
      console.log("Stored access token:", storedToken);

      if (storedToken) {
        Alert.alert("Login Successful");
        // Check if user exists and route accordingly
        checkIfUserExists(userId);
      } else {
        throw new Error("Failed to store access token.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  // Handle OAuth login
  const handleOAuthLogin = async (provider: OAuthProvider) => {
    const config: AuthSession.AuthRequestConfig = {
      clientId: clientIds[provider],
      scopes: ["openid", "profile", "email"],
      redirectUri,
    };

    const authRequest = new AuthSession.AuthRequest(config);
    const result = await authRequest.promptAsync(discovery[provider]);

    if (result.type === "success" && result.params.access_token) {
      await AsyncStorage.setItem("accessToken", result.params.access_token);
      Alert.alert(`${provider} Login Successful!`);
      router.replace("/");
    } else {
      Alert.alert(`${provider} Login Failed`, result.type);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("google")}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="black"
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Login with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("github")}
            >
              <Ionicons
                name="logo-github"
                size={20}
                color="black"
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Login with GitHub</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs with Labels */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#c7c7c7"
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#c7c7c7"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              {/* Eye icon inside input */}
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={24}
                  color="gray"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    height: 50,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    color: "#000",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  oauthContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  signupLink: { color: "blue", marginTop: 10, textAlign: "right" },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  oauthIcon: {
    marginRight: 10,
  },
  oauthButtonText: {
    textAlign: "center",
    flex: 1, // Center text inside the button
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#000",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#000",
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
