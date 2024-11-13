import {
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import BackButton from "../ui/backButton";
import RNPickerSelect from "react-native-picker-select";
import { ClubData } from "@/types";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";

interface CreateClubProps {
  pickImage: () => Promise<void>;
  createModalVisible: boolean;
  setCreateModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  logoFile: any;
  description: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  name: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  handleCreateClub: () => void;
  setMaxMembers: React.Dispatch<React.SetStateAction<number | null>>;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalVisible: boolean;
  createdClub: ClubData | null;
}

export const CreateClub = ({
  pickImage,
  createModalVisible,
  setCreateModalVisible,
  logoFile,
  description,
  setName,
  name,
  setDescription,
  location,
  setLocation,
  loading,
  handleCreateClub,
  setMaxMembers,
  setModalVisible,
  modalVisible,
  createdClub,
}: CreateClubProps) => {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);

  const handleBegin = (clubId: string | undefined) => {
    if (!clubId) {
      Alert.alert("Error", "Club ID is missing.");
      return;
    }
    setModalVisible(false);
    router.push({
      pathname: `/clubHome/[id]`,
      params: { id: clubId },
    });
  };

  // Share QR code logic with loading indicator and error handling
  const handleShare = async () => {
    try {
      if (!createdClub?.qr_code) {
        Alert.alert("Error", "No QR code available to share.");
        return;
      }

      setIsSharing(true);

      // Convert the base64 QR code to a binary file and save it to the cache directory
      const base64Data = createdClub.qr_code.replace(
        /^data:image\/png;base64,/,
        ""
      );
      const fileUri = `${FileSystem.cacheDirectory}club-qr-code.png`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if the device supports the native share dialog
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device.");
        return;
      }

      // Share the saved image with an optional invite message
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Share your Club QR Code",
        UTI: "image/png", // Required for iOS devices
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Failed to share QR code.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Modal
        visible={createModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalTitle}>Create a Club</CustomText>
          <BackButton func={() => setCreateModalVisible(false)} />

          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image
              source={
                logoFile
                  ? { uri: logoFile.uri }
                  : require("../../assets/img/avatar-placeholder.png")
              }
              style={styles.logoPreview}
            />
            <CustomText style={styles.avatarText}>Select Logo</CustomText>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Club Name"
            placeholderTextColor="#c7c7c7"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Club Description"
            placeholderTextColor="#c7c7c7"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Location (City, Area, etc.)"
            placeholderTextColor="#c7c7c7"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(value) => setMaxMembers(value)}
              items={[
                { label: "10 Members", value: 10 },
                { label: "25 Members", value: 25 },
                { label: "50 Members", value: 50 },
                { label: "100 Members", value: 100 },
              ]}
              style={pickerSelectStyles}
              placeholder={{ label: "Select Max Members", value: null }}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleCreateClub();
            }}
            disabled={loading}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CustomText style={styles.buttonText}>Create Club</CustomText>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Confirmation Modal with QR Code */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header with Share Button */}
          <CustomText style={styles.modalTitle}>
            Club Created Successfully!
          </CustomText>
          <View style={styles.header}></View>
          <CustomText style={styles.inviteCode}>
            Invite Code: {createdClub?.invite_code}
          </CustomText>

          {createdClub?.qr_code && (
            <Image
              source={{ uri: createdClub.qr_code }}
              style={styles.qrCode}
            />
          )}

          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            {isSharing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Ionicons name="share-outline" size={24} color="#000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleBegin(createdClub?.id)}
            style={styles.button}
          >
            <CustomText style={styles.buttonText}>Begin</CustomText>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 20,
  },
  avatarContainer: { alignItems: "center", marginBottom: 10 },
  avatarText: { color: "#4F46E5", marginBottom: 15 },
  logoPreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  textArea: { height: 100 },
  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  shareButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    marginBottom: 30,
  },
  pickerContainer: { marginBottom: 20, width: "100%" },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "HostGrotesk-Medium" },
  inviteCode: { fontSize: 18, marginBottom: 10 },
  qrCode: { width: 200, height: 200, marginBottom: 5 },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
};
