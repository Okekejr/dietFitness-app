import CustomText from "@/components/ui/customText";
import { useUserData } from "@/context/userDataContext";
import { measurement } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  Image,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "@/constants/apiUrl";
import { useThemeColor } from "@/hooks/useThemeColor";

type ProfileTypes = {
  key: string;
  name: string;
  data: string | number | undefined;
}[];

export default function PersonalProfile() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const subTextColor = useThemeColor({}, "subText");
  const iconColor = useThemeColor({}, "icon");
  const [profilePicture, setProfilePicture] = useState(
    userData?.profile_picture || ""
  );
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const initialState = useMemo(
    () => ({
      profilePicture: userData?.profile_picture || "",
    }),
    [userData]
  );

  useEffect(() => {
    const hasChanges = profilePicture !== initialState.profilePicture;
    setIsFormChanged(hasChanges);
  }, [profilePicture]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);

        // Check if the file exists and has a size
        if (
          fileInfo.exists &&
          fileInfo.size &&
          fileInfo.size > 3 * 1024 * 1024
        ) {
          Alert.alert(
            "Error",
            "File size exceeds 3MB limit. Please select a smaller image."
          );
          return;
        }

        // If valid, set the image
        setProfilePicture(uri);
      } catch (error) {
        console.error("Error getting file info:", error);
        Alert.alert("Error", "Could not get image file info.");
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (profilePicture && profilePicture !== userData?.profile_picture) {
        const formData = new FormData();
        formData.append("profilePicture", {
          uri: profilePicture,
          type: "image/jpeg",
          name: `${userData?.user_id}.jpg`,
        } as any);

        const response = await fetch(
          `${API_URL}/api/upload-profile-picture/${userData?.user_id}`,
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to upload profile picture."
          );
        }
      }

      Alert.alert("Success", "Profile updated successfully!");
      refetchUserData();
      router.back();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const profileConfig: ProfileTypes = [
    { key: "name", name: "NAME", data: userData?.name },
    { key: "email", name: "EMAIL", data: userData?.email },
    { key: "age", name: "AGE", data: userData?.age },
    { key: "weight", name: "WEIGHT", data: userData?.weight },
    { key: "height", name: "HEIGHT", data: userData?.height },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormChanged || loading}
        >
          <CustomText
            style={[
              styles.saveText,
              { color: isFormChanged ? textColor : "gray" },
            ]}
          >
            Save
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        <CustomText style={[styles.headerText, { color: textColor }]}>
          Profile Information
        </CustomText>

        <View style={styles.scrollContent}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require("../assets/img/avatar-placeholder.png")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

          <Button title="Upload Picture" onPress={pickImage} />
        </View>

        <View style={[styles.categoryContainer, { borderColor: iconColor }]}>
          <FlatList
            data={profileConfig}
            keyExtractor={(item) => item.name}
            renderItem={({ item, index }) => (
              <View style={styles.categoryBox}>
                <CustomText style={[styles.boxHeader, { color: subTextColor }]}>
                  {item.name}
                </CustomText>
                <CustomText style={[styles.boxText, { color: textColor }]}>
                  {item.data} {measurement(item.key)}
                </CustomText>
                {index < profileConfig.length - 1 ? (
                  <View style={styles.dividerContainer}>
                    <View
                      style={[styles.line, { backgroundColor: iconColor }]}
                    />
                  </View>
                ) : (
                  ""
                )}
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { padding: 20, gap: 20, marginTop: 10 },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  saveText: { fontSize: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  avatarContainer: {
    marginBottom: 5,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    alignSelf: "center",
  },
  categoryContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  categoryBox: {
    display: "flex",
    flexDirection: "column",
    padding: 10,
    gap: 4,
  },
  boxHeader: {
    fontSize: 16,
  },
  boxText: { fontSize: 20, color: "#000", fontFamily: "HostGrotesk-Medium" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  line: {
    flex: 1,
    height: 1,
  },
});
