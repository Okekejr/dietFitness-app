import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/apiUrl";
import { useUserData } from "@/context/userDataContext";
import BackButton from "../ui/backButton";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";

interface JoinClubProps {
  onClose: () => void;
}

const JoinClub = ({ onClose }: JoinClubProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>("");
  const { userData } = useUserData();
  const router = useRouter();

  useEffect(() => {
    const getCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermission();
  }, []);

  const resetScanner = () => {
    scanTimeout.current = setTimeout(() => setScanned(false), 1000);
  };

  const handleJoinClub = async (inviteCode: string) => {
    if (!userData) return;

    setLoading(true);
    try {
      const clubResponse = await fetch(
        `${API_URL}/api/clubs/exists/${inviteCode}`
      );
      if (!clubResponse.ok) {
        Alert.alert("Invalid Code", "This club does not exist.");
        setLoading(false);
        return;
      }

      const club = await clubResponse.json();

      const userClubResponse = await fetch(
        `${API_URL}/api/clubs/userClub/${userData.user_id}`
      );
      if (userClubResponse.ok) {
        const userClub = await userClubResponse.json();
        Alert.alert(
          "Already in a Club",
          `You are already in: ${userClub.name}.`
        );
        setLoading(false);
        return;
      }

      if (club.members_count >= club.max_members) {
        Alert.alert("Club Full", "This club has reached its maximum capacity.");
        setLoading(false);
        return;
      }

      const addMemberResponse = await fetch(`${API_URL}/api/clubs/addMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.user_id,
          clubId: club.id,
          isLeader: false,
        }),
      });

      if (addMemberResponse.ok) {
        Alert.alert("Success", `You joined the club: ${club.name}.`);
        router.push(`/clubHome/${club.id}`);
      } else {
        throw new Error("Failed to join the club.");
      }
    } catch (error) {
      console.error("Error joining club:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    handleJoinClub(data);
    resetScanner();
  };

  useEffect(() => {
    return () => {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
    };
  }, []);

  if (hasPermission === null) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <CustomText style={styles.errorText}>No access to camera</CustomText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BackButton func={onClose} icon="close" />
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          {scanned && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setScanned(false);
              }}
              style={styles.scanButton}
            >
              <CustomText style={styles.scanButtonText}>Scan Again</CustomText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Invite Code"
            placeholderTextColor="#c7c7c7"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleJoinClub(code);
            }}
          >
            <CustomText style={styles.submitButtonText}>Join Club</CustomText>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#4F46E5" />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  inputContainer: { marginBottom: 30 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
  },
  cameraContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    height: 300,
    padding: 20,
  },
  scanButton: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 10,
  },
  scanButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "HostGrotesk-Medium",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "red" },
});

export default JoinClub;
