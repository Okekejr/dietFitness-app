import React, { useEffect, useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getInitials } from "@/utils";
import { useUserData } from "@/context/userDataContext";
import SuperTokens from "supertokens-react-native";
import { ClubData } from "@/types";
import { API_URL } from "@/constants/apiUrl";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import CustomText from "@/components/ui/customText";

export default function ProfileScreen() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [loadingClubData, setLoadingClubData] = useState(true);

  useEffect(() => {
    refetchUserData();
    fetchClubData();
  }, []);

  const fetchClubData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/clubs/userClub/${userData?.user_id}`
      );

      if (response.ok) {
        const data: ClubData = await response.json();
        setClubData(data);
      } else {
        console.log("No club found");
      }
    } catch (error) {
      console.error("Error fetching club data:", error);
    } finally {
      setLoadingClubData(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await SuperTokens.signOut();
      Alert.alert("Signed Out", "You have been signed out successfully.");

      // Redirect to the login page
      router.replace("/login");
    } catch (error) {
      Alert.alert("Sign Out Failed", (error as Error).message);
    }
  };

  // Share QR code logic
  const handleShare = async () => {
    try {
      if (!clubData?.qr_code) {
        Alert.alert("Error", "No QR code available to share.");
        return;
      }

      setIsSharing(true);

      const base64Data = clubData.qr_code.replace(
        /^data:image\/png;base64,/,
        ""
      );
      const fileUri = `${FileSystem.cacheDirectory}club-qr-code.png`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Share your Club QR Code",
        UTI: "image/png",
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Failed to share QR code.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileBox}
        onPress={() => router.push("/editProfile")}
      >
        {userData?.profile_picture ? (
          <Image
            source={{ uri: userData.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <CustomText style={styles.avatarText}>
              {userData && getInitials(userData.name)}
            </CustomText>
          </View>
        )}
        <View style={styles.profileInfo}>
          <CustomText style={styles.name}>
            {userData && userData.name}
          </CustomText>
          <CustomText style={styles.email}>
            {userData && userData.email}
          </CustomText>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.box}>
        <Ionicons name="settings-outline" size={24} color="#000" />
        <CustomText style={styles.boxText}>Settings</CustomText>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.box}
        onPress={() => router.push("/helpScreen")}
      >
        <Ionicons name="help-circle-outline" size={24} color="#000" />
        <CustomText style={styles.boxText}>Help and Info</CustomText>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.box} onPress={handleSignOut}>
        <CustomText style={styles.boxText}>Sign out</CustomText>
        <Ionicons name="log-out-outline" size={24} color="#000" />
      </TouchableOpacity>

      {loadingClubData ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        clubData && (
          <View style={styles.qrCodeContainer}>
            <CustomText
              style={{
                fontFamily: "HostGrotesk-Medium",
                fontSize: 20,
                marginBottom: 10,
              }}
            >
              Run Club
            </CustomText>
            <CustomText style={styles.inviteCode}>
              Invite Code: {clubData.invite_code}
            </CustomText>
            <Image source={{ uri: clubData.qr_code }} style={styles.qrCode} />
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              {isSharing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="share-outline" size={24} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginTop: 40,
    marginBottom: 30,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontFamily: "HostGrotesk-Medium", color: "#fff" },
  profileInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontFamily: "HostGrotesk-Medium" },
  email: { fontSize: 14, color: "#777" },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  boxText: { flex: 1, marginLeft: 10, fontSize: 16 },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  inviteCode: { fontSize: 18, marginBottom: 10 },
  qrCode: { width: 200, height: 200, marginBottom: 20 },
  shareButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    marginBottom: 30,
  },
});
