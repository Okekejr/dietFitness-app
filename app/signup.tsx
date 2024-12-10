import CustomText from "@/components/ui/customText";
import Divider from "@/components/ui/divider";
import { handleLogin, validateEmail, validatePassword } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
      : "Password must be at least 6 characters long, include uppercase, lowercase, a number, and a special character.";
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
          <CustomText style={styles.headerText}>Create an account</CustomText>
          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity style={styles.oauthButton}>
              <Ionicons
                name="logo-apple"
                size={20}
                color="#fff"
                style={styles.oauthIcon}
              />
              <CustomText style={styles.oauthButtonText}>
                Sign up with Apple
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Inputs with Labels */}
          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>Email</CustomText>
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
              <CustomText style={styles.errorText}>{errors.email}</CustomText>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>Password</CustomText>
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
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>Confirm Password</CustomText>
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
            {errors.password ? (
              <CustomText style={styles.errorText}>
                {errors.password}
              </CustomText>
            ) : (
              <CustomText style={styles.helperText}>
                Password must include:
                {"\n"}- At least 6 characters
                {"\n"}- Uppercase and lowercase letters
                {"\n"}- A number and a special character
              </CustomText>
            )}
          </View>

          {/* sign in Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonDisabled && styles.disabledButton,
            ]}
            onPress={handleSignup}
          >
            <CustomText style={styles.loginButtonText}>Sign Up</CustomText>
          </TouchableOpacity>

          <Divider text="OR" />

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/login")}
          >
            <CustomText style={styles.loginButtonText}>
              Have an account? Log in
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
  helperText: {
    color: "#6B7280",
    marginTop: 5,
    fontSize: 12,
  },
});
