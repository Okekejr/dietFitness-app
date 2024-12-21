import React, { useEffect, useRef, useState } from "react";
import {
  TextInput,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { API_URL, AppName } from "@/constants/apiUrl";
import Divider from "@/components/ui/divider";
import { useUserData } from "@/context/userDataContext";
import CustomText from "@/components/ui/customText";
import { PasswordLess } from "@/components/login/passwordless";
import { LoginWithPassword } from "@/components/login/loginWithPassword";

// Open the browser session correctly (required for standalone apps)
WebBrowser.maybeCompleteAuthSession();

interface loginProps {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { userData } = useUserData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loginPassword, setLoginPassword] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { refetchUserData } = useUserData();
  const [stored, setStored] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Enable button only if both fields are filled
    setButtonDisabled(!(email && password));

    const storedPassword = async () => {
      const storedPassword = await SecureStore.getItemAsync(
        "biometric_password"
      );
      setStored(storedPassword);
    };

    storedPassword();
  }, [email, password, stored]);

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

  const handleLoginWithBiometrics = async () => {
    try {
      const biometricEnabled = await SecureStore.getItemAsync(
        `biometricEnabled_${userData?.user_id}`
      );

      if (biometricEnabled === "true") {
        const biometricAuth = await LocalAuthentication.authenticateAsync({
          promptMessage: "Login with biometrics",
          fallbackLabel: "Use password",
          disableDeviceFallback: false,
        });

        if (biometricAuth.success) {
          const storedEmail = await SecureStore.getItemAsync("biometric_email");
          const storedPassword = await SecureStore.getItemAsync(
            "biometric_password"
          );

          if (!storedEmail || !storedPassword) {
            Alert.alert(
              "Error",
              "No biometric credentials found. Please login manually."
            );
            return;
          }

          await handleLogin({ email: storedEmail, password: storedPassword });
        } else {
          Alert.alert("Authentication Failed", "Biometric login unsuccessful.");
        }
      }
    } catch (error) {
      console.error("Biometric Login Error:", error);
      Alert.alert("Error", "Biometric login failed.");
    }
  };

  // Helper function to check if the user exists
  const checkIfUserExists = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);

      if (response.ok) {
        const userData = await response.json();
        console.log("User exists:", userData.name);
        refetchUserData();
        router.replace({ pathname: "/" }); // User found
      } else if (response.status === 404) {
        console.log("User not found.");
        router.replace({ pathname: "/personalInfo" });
      } else {
        console.error("Failed to fetch user:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      Alert.alert("Error", "Unable to verify user. Please try again.");
    }
  };

  const handleLogin = async ({ email, password }: loginProps) => {
    if ((!validateInputs() && !email) || !password) return; // Ensure inputs are valid

    try {
      setLoading(true);

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

      // Save biometric credentials if enabled
      const biometricEnabled = await SecureStore.getItemAsync(
        `biometricEnabled_${userId}`
      );

      if (biometricEnabled === "true" && email && password) {
        await SecureStore.setItemAsync("biometric_email", email);
        await SecureStore.setItemAsync("biometric_password", password);
      }

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
    } finally {
      setLoading(false); // Ensure loading state is cleared
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
          <CustomText style={styles.headerText}>Log in to {AppName}</CustomText>

          {loginPassword ||
          !userData ||
          !userData.biometric_enabled ||
          userData?.is_deleted === true ||
          stored === null ? (
            <LoginWithPassword
              setEmail={setEmail}
              setPassword={setPassword}
              handleLogin={handleLogin}
              setPasswordVisible={setPasswordVisible}
              passwordInputRef={passwordInputRef}
              emailInputRef={emailInputRef}
              email={email}
              password={password}
              isPasswordVisible={isPasswordVisible}
              isButtonDisabled={isButtonDisabled}
              errors={errors}
              loading={loading}
            />
          ) : (
            <PasswordLess
              userData={userData}
              setLoginPassword={setLoginPassword}
              handleLoginWithBiometrics={handleLoginWithBiometrics}
            />
          )}

          <Divider text="OR" />

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/signup")}
          >
            <CustomText style={styles.loginButtonText}>
              New to our app? Sign up
            </CustomText>
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
  headerText: {
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 30,
    fontSize: 20,
    color: "#000",
  },
  oauthContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  signupLink: { color: "blue", textAlign: "right" },
  signUpButton: {
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: "#000",
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
