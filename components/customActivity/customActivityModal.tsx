import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import BackButton from "../ui/backButton";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";

interface AddCustomProps {
  onClose: () => void;
}

export default function AddCustomActivity({ onClose }: AddCustomProps) {
  const queryClient = useQueryClient();
  const { userData } = useUserData();
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [intensity, setIntensity] = useState("");
  const [tag, setTag] = useState("");

  const [intensityPickerVisible, setIntensityPickerVisible] = useState(false);
  const [tagPickerVisible, setTagPickerVisible] = useState(false);

  const handleSubmit = async () => {
    if (!userData) {
      return;
    }

    // Check if required fields are filled out
    if (!duration || !caloriesBurned) {
      Alert.alert("Error", "Please fill out all required fields.");
      return;
    }

    // Convert duration and caloriesBurned to numbers
    const parsedDuration = parseInt(duration, 10);
    const parsedCaloriesBurned = parseInt(caloriesBurned, 10);

    // Check if duration and calories burned are valid numbers
    if (
      isNaN(parsedDuration) ||
      isNaN(parsedCaloriesBurned) ||
      parsedDuration <= 0 ||
      parsedCaloriesBurned <= 0
    ) {
      Alert.alert(
        "Error",
        "Please enter valid numeric values for duration and calories burned."
      );
      return;
    }

    console.log(
      userData.user_id,
      parsedDuration,
      parsedCaloriesBurned,
      intensity,
      tag
    );

    try {
      const response = await fetch(`${API_URL}/api/customActivity/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user_id,
          duration: parsedDuration, // Send parsed value
          caloriesBurned: parsedCaloriesBurned, // Send parsed value
          intensity,
          tag,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add custom activity.");
      }

      Alert.alert("Success", "Custom activity added!");
      queryClient.invalidateQueries({
        queryKey: ["userOverview", userData.user_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["getCompleted"],
      });
      setDuration("");
      setCaloriesBurned("");
      setIntensity("Low");
      setTag("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add custom activity.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BackButton func={onClose} icon="close" />

        <CustomText style={styles.headerText}>Add Activity</CustomText>

        <View style={styles.inputContainer}>
          <CustomText style={styles.label}>Duration</CustomText>
          <TextInput
            style={styles.input}
            placeholder="Duration (minutes)"
            value={duration}
            onChangeText={(text) => setDuration(text.replace(/[^0-9]/g, ""))} // Only allow numbers
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomText style={styles.label}>Calories burned</CustomText>
          <TextInput
            style={styles.input}
            placeholder="Calories Burned"
            value={caloriesBurned}
            onChangeText={(text) =>
              setCaloriesBurned(text.replace(/[^0-9]/g, ""))
            } // Only allow numbers
            keyboardType="numeric"
          />
        </View>

        {/* Intensity Picker */}
        <TouchableOpacity style={styles.inputContainer}>
          <CustomText style={styles.label}>Intensity</CustomText>
          <TextInput
            style={styles.input}
            placeholder="Select Intensity"
            onPress={() => setIntensityPickerVisible(true)}
            value={intensity}
            editable={false}
          />
        </TouchableOpacity>

        {/* Tag Picker */}
        <TouchableOpacity style={styles.inputContainer}>
          <CustomText style={styles.label}>Tag</CustomText>
          <TextInput
            style={styles.input}
            placeholder="Select Tag"
            onPress={() => setTagPickerVisible(true)}
            value={tag}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleSubmit();
          }}
        >
          <CustomText style={styles.submitButtonText}>Add Activity</CustomText>
        </TouchableOpacity>

        {/* Intensity Picker Modal */}
        <Modal
          visible={intensityPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIntensityPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setIntensityPickerVisible(false)}
          >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
              <TouchableOpacity
                onPress={() => setIntensityPickerVisible(false)}
                style={styles.cancelButton}
              >
                <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
              </TouchableOpacity>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={intensity}
                  onValueChange={(itemValue) => setIntensity(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={tagPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTagPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setTagPickerVisible(false)}
          >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
              <TouchableOpacity
                onPress={() => setTagPickerVisible(false)}
                style={styles.cancelButton}
              >
                <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
              </TouchableOpacity>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tag}
                  onValueChange={(itemValue) => setTag(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Cardio" value="Cardio" />
                  <Picker.Item
                    label="Strength Training"
                    value="Strength Training"
                  />
                  <Picker.Item label="HIIT" value="HIIT" />
                  <Picker.Item label="Core" value="Core" />
                  <Picker.Item label="Endurance" value="Endurance" />
                </Picker>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  headerText: {
    marginBottom: 30,
    fontSize: 20,
    color: "#000",
    fontFamily: "HostGrotesk-Medium",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Align modal at the bottom
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 20, // Padding at the bottom for spacing
  },
  cancelButton: {
    paddingLeft: 20,
    paddingTop: 10,
  },
  cancelButtonText: {
    fontSize: 18,
    color: "#000", // Blue color for the 'Cancel' text
    fontFamily: "HostGrotesk-Regular", // Customize font if needed
  },
  pickerContainer: {
    paddingVertical: 10,
  },
  picker: {
    height: 150, // Adjust as needed
    width: "100%",
  },
});
