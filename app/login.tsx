import React, { useEffect, useRef, useState } from "react";
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
import Divider from "@/components/ui/divider";

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
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isButtonDisabled, setButtonDisabled] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // Enable button only if both fields are filled
    setButtonDisabled(!(email && password));
  }, [email, password]);

  const validateInputs = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Please provide your email.";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "Please provide your password.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Helper function to check if the user exists
  const checkIfUserExists = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);

      if (response.ok) {
        const userData = await response.json();
        console.log("User exists:", userData.name);
        router.replace("/"); // User found
      } else if (response.status === 404) {
        console.log("User not found.");
        router.replace("/personalInfo");
      } else {
        console.error("Failed to fetch user:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      Alert.alert("Error", "Unable to verify user. Please try again.");
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (!validateInputs()) return; // Ensure inputs are valid

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
        throw new Error(errorData.message || "Invalid email or password.");
      }

      const data = await response.json();
      const userId = data?.user?.id;
      console.log("User ID:", userId);

      if (!userId) throw new Error("User not found. Please sign up.");

      await AsyncStorage.setItem("accessToken", userId);
      const storedToken = await AsyncStorage.getItem("accessToken");

      if (storedToken) {
        Alert.alert("Login Successful");
        checkIfUserExists(userId);
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
          <Text style={styles.headerText}>Log in to our app</Text>
          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("google")}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="#fff"
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
                color="#fff"
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
              style={[styles.input, errors.email ? styles.errorInput : null]}
              placeholder="Email Address"
              placeholderTextColor="#c7c7c7"
              value={email}
              onChangeText={(text) => setEmail(text.trim())}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordstyle}>
              <Text style={styles.passwordLabel}>Password</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.signupLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[
                  styles.passwordInput,
                  errors.password ? styles.errorInput : null,
                ]}
                placeholder="Password"
                placeholderTextColor="#c7c7c7"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={() => handleLogin(email, password)}
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
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonDisabled && styles.disabledButton,
            ]}
            onPress={() => handleLogin(email, password)}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <Divider text="OR" />

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.loginButtonText}>New to our app? Sign up</Text>
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
    backgroundColor: "#F5F7FA",
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
  headerText: {
    fontWeight: "bold",
    marginBottom: 30,
    fontSize: 20,
    color: "#000",
  },
  passwordInput: {
    flex: 1,
    color: "#000",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  passwordLabel: {
    fontSize: 14,
    color: "#000",
  },
  passwordstyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
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
    backgroundColor: "#000",
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
    color: "#fff",
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
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  signUpButton: {
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: "#000",
  },
});
