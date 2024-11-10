import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Image,
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
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import CustomText from "@/components/ui/customText";

export default function EditProfileScreen() {
  const { userData, refetchUserData } = useUserData();
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState(
    userData?.profile_picture || ""
  );
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
      profilePicture !== initialState.profilePicture ||
      activityLevel !== initialState.activityLevel ||
      JSON.stringify(allergies) !== JSON.stringify(initialState.allergies) ||
      JSON.stringify(preferences) !== JSON.stringify(initialState.preferences);
    setIsFormChanged(hasChanges);
  }, [profilePicture, activityLevel, allergies, preferences, initialState]);

  // Handle image selection
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);

        // Check if the file exists and has a size
        if (
          fileInfo.exists &&
          fileInfo.size &&
          fileInfo.size > 3 * 1024 * 1024
        ) {
          Alert.alert(
            "Error",
            "File size exceeds 3MB limit. Please select a smaller image."
          );
          return;
        }

        // If valid, set the image
        setProfilePicture(uri);
      } catch (error) {
        console.error("Error getting file info:", error);
        Alert.alert("Error", "Could not get image file info.");
      }
    }
  };

  const togglePreference = (key: "diet" | "workout", value: string) => {
    const currentPreferences = preferences[key];
    const newPreferences = currentPreferences.includes(value)
      ? currentPreferences.filter((pref) => pref !== value)
      : [...currentPreferences, value];
    setPreferences((prev) => ({ ...prev, [key]: newPreferences }));
  };

  // Handle TextInput changes and convert input to an array
  const handleAllergiesChange = (text: string) => {
    setAllergies(text.split(",").map((item) => item.trim()));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (profilePicture && profilePicture !== userData?.profile_picture) {
        const formData = new FormData();
        formData.append("profilePicture", {
          uri: profilePicture,
          type: "image/jpeg",
          name: `${userData?.user_id}.jpg`,
        } as any);

        const response = await fetch(
          `${API_URL}/api/upload-profile-picture/${userData?.user_id}`,
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to upload profile picture."
          );
        }
      }

      await fetch(`${API_URL}/api/users/${userData?.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_level: activityLevel,
          allergies,
          preferences,
        }),
      });

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
            <TouchableOpacity onPress={() => router.back()}>
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
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require("../assets/img/avatar-placeholder.png")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

          <Button title="Upload Picture" onPress={pickImage} />

          <View style={styles.formGroup}>
            <CustomText style={styles.heading}>Preferences</CustomText>

            <CustomText style={styles.subHeading}>
              Dietary Preferences
            </CustomText>
            {["vegan", "vegetarian", "low-carb"].map((diet) => (
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
              <Picker.Item label="Sedentary" value="sedentary" />
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Moderate" value="moderate" />
              <Picker.Item label="Active" value="active" />
              <Picker.Item label="Very Active" value="very-active" />
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
  },
  saveText: { fontSize: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
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
