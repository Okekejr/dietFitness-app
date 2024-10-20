import Divider from "@/components/ui/divider";
import { handleLogin, validateEmail, validatePassword } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isEmailUnique, setEmailUnique] = useState(true);

  const router = useRouter();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isButtonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    const passwordsMatch =
      password && confirmPassword && password === confirmPassword;
    setButtonDisabled(!(email && passwordsMatch && isEmailUnique));
  }, [email, password, confirmPassword, isEmailUnique]);

  // Check if the email is unique
  const checkEmailExists = async (email: string) => {
    if (!validateEmail(email)) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/emailpassword/email/exists?email=${email}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        setEmailUnique(!data.exists);
        if (data.exists) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered.",
          }));
        } else {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      } else {
        throw new Error("Failed to validate email.");
      }
    } catch (error) {
      console.error("Error checking email uniqueness:", error);
      Alert.alert("Error", "Unable to check email uniqueness.");
    }
  };

  const handleSignup = async () => {
    const emailError = validateEmail(email) ? "" : "Invalid email format.";
    const passwordError = validatePassword(password)
      ? ""
      : "Password must be at least 6 characters.";
    const confirmError =
      password === confirmPassword ? "" : "Passwords do not match.";

    if (emailError || passwordError || confirmError) {
      setErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmError,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields: [
            { id: "email", value: email },
            { id: "password", value: password },
          ],
        }),
      });

      const data = await response.json();

      if (data.status === "OK") {
        await handleLogin(email, password);
        router.replace("/personalInfo");
      } else if (data.status === "FIELD_ERROR") {
        const fieldErrors = data.formFields.reduce((acc: any, field: any) => {
          acc[field.id] = field.error;
          return acc;
        }, {});
        setErrors(fieldErrors);
      } else {
        throw new Error(data.message || "Signup failed.");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
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
          <Text style={styles.headerText}>Create an account</Text>
          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity style={styles.oauthButton}>
              <Ionicons
                name="logo-google"
                size={20}
                color="#fff"
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Sign up with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.oauthButton}>
              <Ionicons
                name="logo-github"
                size={20}
                color="#fff"
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Sign up with GitHub</Text>
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
              onChangeText={(text) => {
                setEmail(text);
                checkEmailExists(text);
              }}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
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
                onSubmitEditing={handleSignup}
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#c7c7c7"
                secureTextEntry={!isPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onSubmitEditing={handleSignup}
              />
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
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* sign in Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonDisabled && styles.disabledButton,
            ]}
            onPress={handleSignup}
          >
            <Text style={styles.loginButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <Divider text="OR" />

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Have an account? Log in</Text>
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
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#000",
  },
  errorText: {
    color: "red",
    marginTop: 5,
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
  oauthContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  eyeIcon: {
    marginLeft: 10,
  },
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
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  headerText: {
    fontWeight: "bold",
    marginBottom: 30,
    fontSize: 20,
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
