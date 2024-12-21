import * as AppleAuthentication from "expo-apple-authentication";
import React from "react";
import { StyleSheet } from "react-native";

type AppleSignInButtonProps = {
  onSignIn: () => void;
};

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ onSignIn }) => {
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={styles.button}
      onPress={onSignIn}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%", // Adjust as needed
    height: 44,
    borderRadius: 5,
  },
});

export default AppleSignInButton;
