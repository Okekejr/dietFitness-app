import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "../ui/customText";
import { Ionicons } from "@expo/vector-icons";
import { UserDataT } from "@/types";
import { FC } from "react";

interface PasswordLessT {
  userData: UserDataT | undefined;
  handleLoginWithBiometrics: () => Promise<void>;
  setLoginPassword: (value: React.SetStateAction<boolean>) => void;
}

export const PasswordLess: FC<PasswordLessT> = ({
  userData,
  handleLoginWithBiometrics,
  setLoginPassword,
}) => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.headerTitle}>
        Welcome back {userData?.name}
      </CustomText>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => handleLoginWithBiometrics()}
      >
        <View style={styles.loginContainer}>
          <CustomText
            style={[styles.loginButtonText, { flex: 1, paddingLeft: 30 }]}
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
        <CustomText style={styles.signupLink}>Login with password</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  loginContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    color: "#000",
  },
  signupLink: { color: "blue", textAlign: "right" },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
