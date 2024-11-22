import React, { useEffect, useState } from "react";
import {
  View,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Href, useRouter } from "expo-router";
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
import { FlatList } from "react-native";
import { ScrollView } from "react-native";

type ProfileConfig = {
  key: string;
  name: string;
  leftIcon: keyof typeof Ionicons.glyphMap;
  rightIcon: keyof typeof Ionicons.glyphMap;
  hrefLink: Href<string>;
}[];

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [loadingClubData, setLoadingClubData] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

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

  const profileSetting: ProfileConfig = [
    {
      key: "Edit Experience",
      name: "Edit Experience",
      leftIcon: "pulse-outline",
      rightIcon: "chevron-forward",
      hrefLink: "/editProfile",
    },
    {
      key: "Settings",
      name: "Settings",
      leftIcon: "settings-outline",
      rightIcon: "chevron-forward",
      hrefLink: "/helpScreen",
    },
    {
      key: "Help and Info",
      name: "Help & Info",
      leftIcon: "information-circle-outline",
      rightIcon: "chevron-forward",
      hrefLink: "/helpScreen",
    },
    {
      key: "Notifications",
      name: "Notifications",
      leftIcon: "notifications-outline",
      rightIcon: "chevron-forward",
      hrefLink: "/notificationSettings",
    },
    {
      key: "Subscription & Billing",
      name: "Subscription & Billing",
      leftIcon: "card-outline",
      rightIcon: "chevron-forward",
      hrefLink: "/subscription",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <CustomText style={styles.headerText}>Profile</CustomText>

        <View style={styles.innerContainer}>
          <TouchableOpacity
            style={styles.profileBox}
            onPress={() => router.push("/personalProfile")}
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

          <View style={styles.categoryContainer}>
            <FlatList
              data={profileSetting}
              scrollEnabled={false}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryBox}
                  onPress={() => router.push(item.hrefLink)}
                >
                  <Ionicons name={item.leftIcon} size={24} color="#000" />
                  <CustomText style={styles.boxText}>{item.name}</CustomText>
                  <Ionicons name={item.rightIcon} size={24} color="#000" />
                </TouchableOpacity>
              )}
            />
          </View>

          <TouchableOpacity style={styles.box} onPress={openModal}>
            <Ionicons name="qr-code-outline" size={24} color="#000" />
            <CustomText style={styles.boxText}>Run Club</CustomText>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={handleSignOut}>
            <CustomText style={styles.boxText}>Sign out</CustomText>
            <Ionicons name="log-out-outline" size={24} color="#000" />
          </TouchableOpacity>

          {/* Modal Component */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeModal}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1} // Prevent accidental clicks through to the background
              onPress={closeModal} // Close modal on backdrop press
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                {loadingClubData ? (
                  <View style={styles.qrCodeContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                  </View>
                ) : clubData ? (
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
                    <Image
                      source={{ uri: clubData.qr_code }}
                      style={styles.qrCode}
                    />
                    <TouchableOpacity
                      onPress={handleShare}
                      style={styles.shareButton}
                    >
                      {isSharing ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Ionicons name="share-outline" size={24} color="#000" />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.qrCodeContainer}>
                    <CustomText>Create or Join a Club</CustomText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    padding: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    marginTop: 10,
  },
  innerContainer: {
    marginTop: 20,
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
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
  categoryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 3,
  },
  categoryContainer: {
    marginVertical: 10,
  },
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end", // Align the modal to the bottom of the screen
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width, // Take up the full width
    height: "auto", // Take up 80% of the height from the bottom
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
