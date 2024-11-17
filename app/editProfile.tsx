import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Switch,
  Alert,
  Platform,
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

export default function EditProfileScreen() {
  const { userData, refetchUserData } = useUserData();
  const router = useRouter();
  const [activityLevel, setActivityLevel] = useState(
    userData?.activity_level || ""
  );
  const [allergies, setAllergies] = useState<string[]>(
    Array.isArray(userData?.allergies)
      ? userData.allergies
      : userData?.allergies
      ? userData.allergies.split(",").map((item) => item.trim())
      : [] // Default to an empty array if undefined
  );

  const [preferences, setPreferences] = useState(
    userData?.preferences || { diet: [], workout: [] }
  );
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const initialState = useMemo(
    () => ({
      profilePicture: userData?.profile_picture || "",
      activityLevel: userData?.activity_level || "",
      allergies: Array.isArray(userData?.allergies)
        ? userData.allergies
        : userData?.allergies
        ? userData.allergies.split(",").map((item) => item.trim())
        : [],
      preferences: userData?.preferences || { diet: [], workout: [] },
    }),
    [userData]
  );

  // Track form changes
  useEffect(() => {
    const hasChanges =
      activityLevel !== initialState.activityLevel ||
      JSON.stringify(allergies) !== JSON.stringify(initialState.allergies) ||
      JSON.stringify(preferences) !== JSON.stringify(initialState.preferences);
    setIsFormChanged(hasChanges);
  }, [activityLevel, allergies, preferences, initialState]);

  const togglePreference = (key: "diet" | "workout", value: string) => {
    // Ensure only one preference is selected at a time
    const newPreferences = [value];
    // Update the preferences state
    setPreferences((prev) => ({
      ...prev,
      [key]: newPreferences,
    }));
  };

  // Handle TextInput changes and convert input to an array
  const handleAllergiesChange = (text: string) => {
    setAllergies(text.split(",").map((item) => item.trim()));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/users/${userData?.user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activity_level: activityLevel,
            allergies,
            preferences,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload profile picture.");
      }

      Alert.alert("Success", "Profile updated successfully!");
      refetchUserData();
      router.back();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              onPress={handleSave}
              disabled={!isFormChanged || loading}
            >
              <CustomText
                style={[
                  styles.saveText,
                  { color: isFormChanged ? "black" : "gray" },
                ]}
              >
                Save
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <CustomText style={styles.heading}>Preferences</CustomText>

            <CustomText style={styles.subHeading}>
              Dietary Preferences
            </CustomText>
            {["balanced", "high-protein", "low-carb"].map((diet) => (
              <View key={diet} style={styles.switchRow}>
                <CustomText style={styles.label}>
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                </CustomText>
                <Switch
                  value={preferences.diet.includes(diet)}
                  onValueChange={() => togglePreference("diet", diet)}
                />
              </View>
            ))}

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
                  value={preferences.workout.includes(goal)}
                  onValueChange={() => togglePreference("workout", goal)}
                />
              </View>
            ))}
          </View>

          <View style={styles.formGroup}>
            <CustomText style={styles.label}>Activity Level</CustomText>
            <Picker
              selectedValue={activityLevel}
              onValueChange={(value) => setActivityLevel(value)}
              style={styles.picker}
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

          <View style={styles.formGroup}>
            <CustomText style={styles.label}>
              Allergies (comma-separated)
            </CustomText>
            <TextInput
              placeholder="e.g., peanuts, shellfish"
              placeholderTextColor="#686D76"
              value={allergies.join(", ")}
              onChangeText={handleAllergiesChange}
              style={styles.input}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  saveText: { fontSize: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginBottom: 10,
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
    color: "#686D76",
  },
  picker: {
    marginVertical: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: 15,
    padding: 5,
  },
});
