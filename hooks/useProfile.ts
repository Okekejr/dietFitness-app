import { API_URL } from "@/constants/apiUrl";
import { ClubData, UserDataT, biometricDataT } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import SuperTokens from "supertokens-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface userProfileT {
  userData: UserDataT | null;
}

export const useProfile = ({ userData }: userProfileT) => {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const {
    data: biometricData,
    isLoading: bioMetricLoading,
    isError: biometricError,
  } = useQuery<biometricDataT>({
    queryKey: ["biometric", userData?.user_id],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/auth/biometricPreference?userId=${userData?.user_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch club data");
      return response.json();
    },
    enabled: !!userData,
  });

  const {
    data: clubData,
    isLoading: loadingClubData,
    isError,
  } = useQuery({
    queryKey: ["userClub", userData?.user_id],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/clubs/userClub/${userData?.user_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch user club.");
      return response.json() as Promise<ClubData>;
    },
    enabled: !!userData,
  });

  const handleSignOut = async () => {
    Alert.alert("Confirm", `You are signing out, Are you sure?`, [
      { text: "Cancel", style: "cancel" }, // Cancel action
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await SuperTokens.signOut();

            // Redirect to the login page
            router.replace("/login");
          } catch (error) {
            Alert.alert("Sign Out Failed", (error as Error).message);
          }
        },
      },
    ]);
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

  const openModal = (content?: string) => {
    setModalVisible(true);
    content && setModalContent(content);
  };

  const closeModal = () => setModalVisible(false);

  return {
    isSharing,
    clubData,
    loadingClubData,
    modalVisible,
    modalContent,
    bioMetricLoading,
    biometricData,
    biometricError,
    setModalVisible,
    setModalContent,
    handleSignOut,
    handleShare,
    openModal,
    closeModal,
  };
};
