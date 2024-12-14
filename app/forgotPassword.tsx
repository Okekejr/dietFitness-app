import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { API_URL } from "@/constants/apiUrl";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { clearAllStoredItems, validateEmail } from "@/utils";
import CustomText from "@/components/ui/customText";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isEmailValid, setEmailValid] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const router = useRouter();

  // Debounce logic to prevent multiple API calls while typing
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Check if email exists
  const checkEmailExists = useCallback(
    debounce(async (email: string) => {
      if (!validateEmail(email)) {
        setEmailValid(false);
        setEmailExists(false); // Reset state if email becomes invalid
        return;
      }

      setCheckingEmail(true); // Start checking
      try {
        const response = await fetch(
          `${API_URL}/api/auth/emailpassword/email/exists?email=${email}`
        );
        const data = await response.json();

        if (data.status === "OK") {
          setEmailValid(true);
          setEmailExists(data.exists); // Set true if the email exists
        } else {
          throw new Error("Failed to validate email.");
        }
      } catch (error) {
        console.error("Error checking email:", error);
        Alert.alert("Error", "Unable to check email. Please try again.");
      } finally {
        setCheckingEmail(false); // Stop checking
      }
    }, 500), // Delay to avoid spamming the API
    []
  );

  // Handle email input change
  useEffect(() => {
    if (email) checkEmailExists(email);
  }, [email]);

  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await fetch(
        `${API_URL}/api/auth/user/password/reset/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formFields: [{ id: "email", value: email }] }),
        }
      );

      const data = await response.json();
      if (data.status === "OK") {
        Alert.alert("Success", "Password reset email sent.");
        clearAllStoredItems();
        router.replace("/login");
      } else {
        throw new Error(data.message || "Failed to send reset email.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/login")}
      >
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>

      <CustomText style={styles.title}>Forgot your password?</CustomText>
      <CustomText style={styles.subTitle}>
        Enter your email, and we'll send you the instructions to reset your
        password.
      </CustomText>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {!isEmailValid && email.length > 0 && (
        <CustomText style={styles.errorText}>
          Please enter a valid email.
        </CustomText>
      )}
      {isEmailValid && !emailExists && (
        <CustomText style={styles.errorText}>
          This email is not registered.
        </CustomText>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          (!emailExists || checkingEmail) && styles.disabledButton,
        ]}
        onPress={handlePasswordReset}
        disabled={!emailExists || checkingEmail || isLoading}
      >
        <CustomText style={styles.buttonText}>
          {isLoading ? "Sending..." : "Send Reset Email"}
        </CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 90,
    left: 20,
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 15,
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 20,
    padding: 5,
  },
  errorText: {
    color: "red",
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    alignSelf: "center",
  },
});
