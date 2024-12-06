import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useUserData } from "@/context/userContext";
import CustomText from "@/components/ui/customText";

export default function PersonalInfoScreen() {
  const { formData, updateFormData } = useUserData();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <CustomText style={styles.heading}>Personal Information</CustomText>

          {/* Name Input */}
          <View style={styles.formGroup}>
            <CustomText style={styles.label}>Name</CustomText>
            <TextInput
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => updateFormData("name", text)}
              style={styles.input}
            />
          </View>

          {/* Weight Input */}
          <View style={styles.formGroup}>
            <CustomText style={styles.label}>Weight (kg)</CustomText>
            <TextInput
              placeholder="e.g., 70"
              keyboardType="numeric"
              value={formData.weight ? formData.weight.toString() : ""}
              onChangeText={(text) =>
                updateFormData("weight", parseFloat(text) || "")
              }
              style={styles.input}
            />
          </View>

          {/* Height Input */}
          <View style={styles.formGroup}>
            <CustomText style={styles.label}>Height (cm)</CustomText>
            <TextInput
              placeholder="e.g., 175"
              keyboardType="numeric"
              value={formData.height ? formData.height.toString() : ""}
              onChangeText={(text) =>
                updateFormData("height", parseFloat(text) || "")
              }
              style={styles.input}
            />
          </View>

          {/* Age Input */}
          <View style={styles.formGroup}>
            <CustomText style={styles.label}>Age (yrs)</CustomText>
            <TextInput
              placeholder="e.g., 25"
              keyboardType="numeric"
              value={formData.age ? formData.age.toString() : ""}
              onChangeText={(text) =>
                updateFormData("age", parseInt(text) || "")
              }
              style={styles.input}
            />
          </View>

          {/* Activity Level Picker */}
          <View style={styles.formGroup}>
            <CustomText style={styles.label}>Activity Level</CustomText>
            <Picker
              selectedValue={formData.activityLevel}
              onValueChange={(value) => updateFormData("activityLevel", value)}
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

          {/* Allergies Input */}
          <View style={styles.formGroup}>
            <CustomText style={styles.label}>
              Allergies (comma-separated)
            </CustomText>
            <TextInput
              placeholder="e.g., peanuts, shellfish"
              value={formData.allergiesInput || ""}
              onChangeText={(text) => {
                updateFormData("allergiesInput", text);
                updateFormData(
                  "allergies",
                  text.split(",").map((allergy) => allergy.trim())
                );
              }}
              style={styles.input}
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push("/preferences")}
          >
            <CustomText style={styles.buttonText}>Next</CustomText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 5,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  nextButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
