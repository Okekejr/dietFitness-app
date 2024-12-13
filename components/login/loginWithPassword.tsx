import { FC } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../ui/customText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface loginProps {
  email: string;
  password: string;
}

interface LoginWithPasswordT {
  setEmail: (value: React.SetStateAction<string>) => void;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleLogin: ({ email, password }: loginProps) => Promise<void>;
  setPasswordVisible: (value: React.SetStateAction<boolean>) => void;
  passwordInputRef: React.RefObject<TextInput>;
  emailInputRef: React.RefObject<TextInput>;
  email: string;
  password: string;
  isPasswordVisible: boolean;
  isButtonDisabled: boolean;
  errors: {
    email: string;
    password: string;
  };
  loading: boolean;
}

export const LoginWithPassword: FC<LoginWithPasswordT> = ({
  setEmail,
  setPassword,
  handleLogin,
  setPasswordVisible,
  passwordInputRef,
  emailInputRef,
  email,
  password,
  isPasswordVisible,
  isButtonDisabled,
  errors,
  loading,
}) => {
  const router = useRouter();

  return (
    <>
      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>Email</CustomText>
        <TextInput
          ref={emailInputRef}
          style={[styles.input, errors.email ? styles.errorInput : null]}
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
          <CustomText style={styles.errorText}>{errors.email}</CustomText>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordstyle}>
          <CustomText style={styles.passwordLabel}>Password</CustomText>
          <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
            <CustomText style={styles.signupLink}>Forgot password?</CustomText>
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
          <TouchableOpacity onPress={() => setPasswordVisible((prev) => !prev)}>
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={24}
              color="gray"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <CustomText style={styles.errorText}>{errors.password}</CustomText>
        ) : null}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, isButtonDisabled && styles.disabledButton]}
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
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
    color: "#000",
  },
  errorInput: {
    borderColor: "red",
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
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#000",
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
  signupLink: { color: "blue", textAlign: "right" },
});
