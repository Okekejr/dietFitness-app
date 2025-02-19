import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Alert,
  Platform,
  Linking,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/ui/customText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function EditProfileScreen() {
  const { userData, refetchUserData } = useUserData();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const subTextColor = useThemeColor({}, "subText");
  const [activityLevel, setActivityLevel] = useState(
    userData?.activity_level || ""
  );
  const initialState = useMemo(
    () => ({
      activityLevel: userData?.activity_level || "",
      preferences: userData?.preferences || { diet: [], workout: [] },
    }),
    [userData]
  );

  const [preferences, setPreferences] = useState(
    userData?.preferences || { diet: [], workout: [] }
  );
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  // Track form changes
  useEffect(() => {
    const hasChanges =
      activityLevel !== initialState.activityLevel ||
      JSON.stringify(preferences) !== JSON.stringify(initialState.preferences);
    setIsFormChanged(hasChanges);
  }, [activityLevel, preferences, initialState]);

  const togglePreference = (key: "diet" | "workout", value: string) => {
    // Ensure only one preference is selected at a time
    const newPreferences = [value];
    // Update the preferences state
    setPreferences((prev) => ({
      ...prev,
      [key]: newPreferences,
    }));
  };

  const handleSave = async () => {
    if (!userData) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/users/userData/updatePlans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityLevel: activityLevel,
            preferences: preferences,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload profile picture.");
      }

      Alert.alert("Success", "Profile updated successfully!");
      refetchUserData();
      router.replace({ pathname: "/" });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    // Show confirmation alert before proceeding with submit
    Alert.alert(
      "Confirm",
      `Saving will create a new schedule,     Are you sure?`,
      [
        { text: "Cancel", style: "cancel" }, // Cancel action
        {
          text: "Proceed",
          onPress: () => handleSave(),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormChanged || loading}
            >
              <CustomText
                style={[
                  styles.saveText,
                  { color: isFormChanged ? textColor : "gray" },
                ]}
              >
                Save
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <CustomText style={[styles.heading, { color: textColor }]}>
              Edit your Experience
            </CustomText>

            <CustomText style={[styles.subHeading, { color: textColor }]}>
              Dietary Preferences
            </CustomText>
            {["balanced", "high-protein", "low-carb"].map((diet) => (
              <View key={diet} style={styles.switchRow}>
                <CustomText style={[styles.label, { color: subTextColor }]}>
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                </CustomText>
                <Switch
                  value={preferences.diet.includes(diet)}
                  onValueChange={() => togglePreference("diet", diet)}
                />
              </View>
            ))}

            <CustomText style={[styles.subHeading, { color: textColor }]}>
              Workout Goals
            </CustomText>
            {["weight-loss", "muscle-gain", "endurance"].map((goal) => (
              <View key={goal} style={styles.switchRow}>
                <CustomText style={[styles.label, { color: subTextColor }]}>
                  {goal
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </CustomText>
                <Switch
                  value={preferences.workout.includes(goal)}
                  onValueChange={() => togglePreference("workout", goal)}
                />
              </View>
            ))}
          </View>

          <View style={styles.formGroup}>
            <CustomText style={[styles.subHeading, { color: textColor }]}>
              Activity Level
            </CustomText>
            <Picker
              selectedValue={activityLevel}
              onValueChange={(value) => setActivityLevel(value)}
              style={[styles.picker, { backgroundColor: backgroundColor }]}
            >
              <Picker.Item label="Select your activity level" value="" />
              <Picker.Item
                label="Sedentary (little or no exercise)"
                value="sedentary"
              />
              <Picker.Item
                label="Light (exercise 1-3 days/week)"
                value="light"
              />
              <Picker.Item
                label="Moderate (exercise 3-5 days/week)"
                value="moderate"
              />
              <Picker.Item
                label="Active (exercise 6-7 days/week)"
                value="active"
              />
              <Picker.Item
                label="Very Active (intense exercise daily)"
                value="very-active"
              />
            </Picker>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  saveText: { fontSize: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  formGroup: {
    width: "100%",
    marginVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
    marginBottom: 30,
  },
  subHeading: {
    fontSize: 18,
    marginVertical: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
  },
  picker: {
    marginVertical: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
  },
});
