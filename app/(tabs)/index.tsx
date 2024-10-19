import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, Alert, Button } from "react-native";
import { Text } from "react-native-paper";
import SuperTokens from "supertokens-react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await SuperTokens.signOut();
      Alert.alert("Signed Out", "You have been signed out successfully.");

      // Redirect to the login page
      router.replace("/login");
    } catch (error) {
      Alert.alert("Sign Out Failed", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to the Home Screen</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
