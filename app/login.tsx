import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/apiUrl";
import Divider from "@/components/ui/divider";
import { useUserData } from "@/context/userDataContext";
import CustomText from "@/components/ui/customText";

// Open the browser session correctly (required for standalone apps)
WebBrowser.maybeCompleteAuthSession();

// Define provider types
type OAuthProvider = "apple";

// Define discovery documents for providers
const discovery: Record<OAuthProvider, AuthSession.DiscoveryDocument> = {
  apple: {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
  },
};

// Client IDs for OAuth providers
const clientIds: Record<OAuthProvider, string> = {
  apple: "your-github-client-id",
};

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "myapp",
});

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
          <CustomText style={styles.headerText}>Log in to our app</CustomText>
          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("apple")}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color="#fff"
                style={styles.oauthIcon}
              />
              <CustomText style={styles.oauthButtonText}>
                Login with Apple
              </CustomText>
            </TouchableOpacity>
          </View>

          {loginPassword ||
          (!userData?.biometric_enabled && userData?.is_deleted) ? (
            <>
              {/* Inputs with Labels */}
              <View style={styles.inputContainer}>
                <CustomText style={styles.label}>Email</CustomText>
                <TextInput
                  ref={emailInputRef}
                  style={[
                    styles.input,
                    errors.email ? styles.errorInput : null,
                  ]}
                  placeholder="Email Address"
                  placeholderTextColor="#c7c7c7"
                  value={email}
                  onChangeText={(text) => setEmail(text.trim())}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? (
                  <CustomText style={styles.errorText}>
                    {errors.email}
                  </CustomText>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordstyle}>
                  <CustomText style={styles.passwordLabel}>Password</CustomText>
                  <TouchableOpacity
                    onPress={() => router.push("/forgotPassword")}
                  >
                    <CustomText style={styles.signupLink}>
                      Forgot password?
                    </CustomText>
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
                    onSubmitEditing={() =>
                      handleLogin({
                        email: email || "",
                        password: password,
                      })
                    }
                  />
                  {/* Eye icon inside input */}
                  <TouchableOpacity
                    onPress={() => setPasswordVisible((prev) => !prev)}
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
                  <CustomText style={styles.errorText}>
                    {errors.password}
                  </CustomText>
                ) : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isButtonDisabled && styles.disabledButton,
                ]}
                onPress={() =>
                  handleLogin({
                    email: email || "",
                    password: password,
                  })
                }
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <CustomText style={styles.loginButtonText}>Log In</CustomText>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <CustomText style={styles.headerTitle}>
                Welcome back {userData?.name}
              </CustomText>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => handleLoginWithBiometrics()}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CustomText
                    style={[
                      styles.loginButtonText,
                      { flex: 1, paddingLeft: 30 },
                    ]}
                  >
                    Log In
                  </CustomText>
                  <Ionicons
                    name="finger-print-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 10 }}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setLoginPassword(true)}>
                <CustomText style={styles.signupLink}>
                  Login with password
                </CustomText>
              </TouchableOpacity>
            </View>
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
    marginBottom: 30,
    fontSize: 20,
    color: "#000",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
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
    marginVertical: 5,
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
  signupLink: { color: "blue", textAlign: "right" },
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
