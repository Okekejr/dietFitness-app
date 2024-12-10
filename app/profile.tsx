import React, { useEffect } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getInitials, profileSetting } from "@/utils";
import { useUserData } from "@/context/userDataContext";
import CustomText from "@/components/ui/customText";
import { FlatList } from "react-native";
import { ScrollView } from "react-native";
import { RunClubQrCode } from "@/components/profile/runClubQrCode";
import { useThemeColor } from "@/hooks/useThemeColor";
import ColorSwitcher from "@/components/profile/colorSwitcher";
import { BiometricSwitcher } from "@/components/profile/biometricSwitcher";
import { useProfile } from "@/hooks/useProfile";
import { DeleteAccount } from "@/components/profile/deleteAccount";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const { userData, refetchUserData } = useUserData();

  const {
    openModal,
    handleSignOut,
    closeModal,
    handleShare,
    isSharing,
    bioMetricLoading,
    biometricData,
    biometricError,
    modalVisible,
    modalContent,
    loadingClubData,
    clubData,
  } = useProfile({
    userData: userData,
  });

  useEffect(() => {
    refetchUserData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <CustomText style={[styles.headerText, { color: textColor }]}>
          Profile
        </CustomText>

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
                  onPress={() => {
                    item.hrefLink && router.push(item.hrefLink);
                    item.content && openModal(item.content);
                  }}
                >
                  <Ionicons name={item.leftIcon} size={24} color="#000" />
                  <CustomText style={styles.boxText}>{item.name}</CustomText>
                  <Ionicons name={item.rightIcon} size={24} color="#000" />
                </TouchableOpacity>
              )}
            />
          </View>

          <TouchableOpacity
            style={styles.box}
            onPress={() => openModal("runClub")}
          >
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
              onPress={closeModal}
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                {modalContent === "runClub" && (
                  <RunClubQrCode
                    loadingClubData={loadingClubData}
                    clubData={clubData}
                    handleShare={handleShare}
                    isSharing={isSharing}
                  />
                )}

                {modalContent === "settings" && (
                  <>
                    <View style={styles.settingContainer}>
                      <ColorSwitcher />
                      <BiometricSwitcher
                        userId={userData?.user_id}
                        biometricData={biometricData}
                        bioMetricLoading={bioMetricLoading}
                        biometricError={biometricError}
                      />
                      <DeleteAccount userId={userData?.user_id} />
                    </View>
                  </>
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
  container: { flex: 1 },
  settingContainer: {
    marginTop: 20,
    marginBottom: 100,
    gap: 5,
  },
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
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
