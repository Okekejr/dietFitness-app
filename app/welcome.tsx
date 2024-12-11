import CustomText from "@/components/ui/customText";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>
      <Text style={styles.subtitle}>Your fitness journey starts here!</Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.replace({ pathname: "/login" })}
      >
        <CustomText style={styles.loginButtonText}>Get Started</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});

export default WelcomeScreen;
