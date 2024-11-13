import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserData } from "@/context/userContext";
import CustomText from "@/components/ui/customText";

export default function PreferencesScreen() {
  const { formData, updateFormData } = useUserData();
  const router = useRouter();

  const togglePreference = (key: string, value: string) => {
    // Directly set the newPreferences to contain only the selected value
    const newPreferences = [value]; // Ensures only one item can be selected at a time

    // Update the form data with the new preferences
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

        <CustomText style={styles.heading}>Preferences</CustomText>

        {/* Dietary Preferences */}
        <CustomText style={styles.subHeading}>Dietary Preferences</CustomText>
        {["balanced", "high-protein", "low-carb"].map((diet) => (
          <View key={diet} style={styles.switchRow}>
            <CustomText style={styles.label}>
              {diet.charAt(0).toUpperCase() + diet.slice(1)}
            </CustomText>
            <Switch
              value={formData.preferences.diet.includes(diet)}
              onValueChange={() => togglePreference("diet", diet)}
            />
          </View>
        ))}

        {/* Workout Goals */}
        <CustomText style={styles.subHeading}>Workout Goals</CustomText>
        {["weight-loss", "muscle-gain", "endurance"].map((goal) => (
          <View key={goal} style={styles.switchRow}>
            <CustomText style={styles.label}>
              {goal
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </CustomText>
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
          <CustomText style={styles.buttonText}>Next</CustomText>
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
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  heading: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
    marginBottom: 30,
  },
  subHeading: {
    fontSize: 20,
    fontFamily: "HostGrotesk-Medium",
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
