import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserData } from "@/context/userContext";
import { API_URL } from "@/constants/apiUrl";
import CustomText from "@/components/ui/customText";

export default function ReviewScreen() {
  const { formData } = useUserData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    const { name, weight, height, age, allergies, preferences, activityLevel } =
      formData;

    // Basic validation
    if (!name || weight <= 0 || height <= 0 || age <= 0) {
      Alert.alert("Error", "Please fill out all fields correctly.");
      return;
    }

    setLoading(true); // Start loading indicator

    try {
      console.log(formData);

      const res = await fetch(`${API_URL}/api/users/userData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          weight,
          height,
          age,
          allergies,
          preferences,
          activityLevel,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProcessing(true);

        // Wait for 6 seconds to ensure data is saved before routing
        setTimeout(() => {
          setProcessing(false); // Stop processing message
          router.replace("/recommendations"); // Navigate to recommendations screen
        }, 6000);
      } else {
        Alert.alert("Error", `Error saving user data: ${data.error}`);
      }
    } catch (err) {
      Alert.alert("Server Error", "An error occurred while saving data.");
      console.error(err);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (processing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <CustomText style={styles.processingText}>
          Saving your information and creating workout...
        </CustomText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/preferences")}
        >
          <Ionicons name="chevron-back-outline" size={28} color="black" />
        </TouchableOpacity>

        <CustomText style={styles.heading}>Review Your Information</CustomText>

        {/* Display User Data */}
        <View style={styles.infoContainer}>
          <CustomText style={styles.infoText}>Name: {formData.name}</CustomText>
          <CustomText style={styles.infoText}>
            Weight: {formData.weight} kg
          </CustomText>
          <CustomText style={styles.infoText}>
            Height: {formData.height} cm
          </CustomText>
          <CustomText style={styles.infoText}>Age: {formData.age}</CustomText>
          <CustomText style={styles.infoText}>
            Allergies: {formData.allergies.join(", ") || "None"}
          </CustomText>
          <CustomText style={styles.infoText}>
            Diet Preferences: {formData.preferences.diet.join(", ") || "None"}
          </CustomText>
          <CustomText style={styles.infoText}>
            Workout Goals: {formData.preferences.workout.join(", ") || "None"}
          </CustomText>
          <CustomText style={styles.infoText}>
            Activity Level: {formData.activityLevel}
          </CustomText>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <CustomText style={styles.buttonText}>Submit</CustomText>
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
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#444",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
