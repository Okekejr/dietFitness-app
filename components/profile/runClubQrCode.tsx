import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../ui/customText";
import { Ionicons } from "@expo/vector-icons";
import { FC } from "react";
import { ClubData } from "@/types";

interface RunClubQRCodeT {
  loadingClubData: boolean;
  clubData: ClubData | null;
  handleShare: () => Promise<void>;
  isSharing: boolean;
}

export const RunClubQrCode: FC<RunClubQRCodeT> = ({
  loadingClubData,
  clubData,
  handleShare,
  isSharing,
}) => {
  return (
    <>
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
          <Image source={{ uri: clubData.qr_code }} style={styles.qrCode} />
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
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
    </>
  );
};

const styles = StyleSheet.create({
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
