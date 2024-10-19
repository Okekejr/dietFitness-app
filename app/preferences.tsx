import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserData } from "@/context/userContext";

export default function PreferencesScreen() {
  const { formData, updateFormData } = useUserData();
  const router = useRouter();

  const togglePreference = (key: string, value: string) => {
    const preferences =
      formData.preferences[key as keyof typeof formData.preferences];
    const newPreferences = preferences.includes(value)
      ? preferences.filter((item: string) => item !== value)
      : [...preferences, value];
    updateFormData("preferences", {
      ...formData.preferences,
      [key]: newPreferences,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/personalInfo")}
        >
          <Ionicons name="chevron-back-outline" size={28} color="black" />
        </TouchableOpacity>

        <Text style={styles.heading}>Preferences</Text>

        {/* Dietary Preferences */}
        <Text style={styles.subHeading}>Dietary Preferences</Text>
        {["vegan", "vegetarian", "low-carb"].map((diet) => (
          <View key={diet} style={styles.switchRow}>
            <Text style={styles.label}>
              {diet.charAt(0).toUpperCase() + diet.slice(1)}
            </Text>
            <Switch
              value={formData.preferences.diet.includes(diet)}
              onValueChange={() => togglePreference("diet", diet)}
            />
          </View>
        ))}

        {/* Workout Goals */}
        <Text style={styles.subHeading}>Workout Goals</Text>
        {["weight-loss", "muscle-gain", "endurance"].map((goal) => (
          <View key={goal} style={styles.switchRow}>
            <Text style={styles.label}>
              {goal
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Text>
            <Switch
              value={formData.preferences.workout.includes(goal)}
              onValueChange={() => togglePreference("workout", goal)}
            />
          </View>
        ))}

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/review")}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 15,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#000",
  },
  nextButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
