import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClubData } from "@/types";
import { getInitials } from "@/utils";
import { format } from "date-fns";
import { API_URL } from "@/constants/apiUrl";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import CustomText from "../ui/customText";

interface ClubDetailsCardProps {
  onBack: () => void;
  club: ClubData;
  isLeader: boolean;
}

const ClubDetailsCard: React.FC<ClubDetailsCardProps> = ({
  onBack,
  club,
  isLeader,
}) => {
  const { name, logo, id: clubId } = club;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      await uploadLogo(result.assets[0].uri);
    }
  };

  const uploadLogo = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("clubLogo", {
        uri,
        type: "image/jpeg",
        name: `logo-${clubId}.jpg`,
      } as any);

      const response = await fetch(
        `${API_URL}/api/clubs/updateLogo/${clubId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.status === 413) {
        Alert.alert(
          "Error",
          "The file is too large. Please select a file under 5 MB."
        );
      } else if (!response.ok) {
        const data = await response.json();
        Alert.alert("Error", data.error || "Failed to update club logo.");
      } else {
        Alert.alert("Success", "Club logo updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <CustomText style={styles.title}>Club Details</CustomText>
      </View>
      <View style={styles.subContainer}>
        <View style={styles.profileContainer}>
          {club?.logo ? (
            <Image
              source={{ uri: logo, cache: "force-cache" }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileFallback}>
              <CustomText style={styles.initials}>
                {club?.name ? getInitials(name) : "?"}
              </CustomText>
            </View>
          )}

          {isLeader && (
            <TouchableOpacity onPress={pickImage} style={styles.editButton}>
              <Ionicons name="pencil-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {loading && <ActivityIndicator size="large" color="#4F46E5" />}
        </View>
        <View style={styles.nameContainer}>
          <CustomText
            style={{ fontFamily: "HostGrotesk-Medium", fontSize: 19 }}
          >
            Name:
          </CustomText>
          <CustomText style={{ fontSize: 18 }}>{club.name}</CustomText>
        </View>
        <View style={styles.descriptionContainer}>
          <CustomText
            style={{ fontFamily: "HostGrotesk-Medium", fontSize: 19 }}
          >
            Description:
          </CustomText>
          <CustomText style={{ fontSize: 18, maxWidth: 200 }}>
            {club.description}
          </CustomText>
        </View>
        <View style={styles.createdContainer}>
          <CustomText
            style={{ fontFamily: "HostGrotesk-Medium", fontSize: 19 }}
          >
            Date created:
          </CustomText>
          <CustomText style={{ fontSize: 18 }}>{formatDate(club)}</CustomText>
        </View>
      </View>
    </View>
  );
};

const formatDate = (club: ClubData) => {
  const date = new Date(club.created_at);
  const monthYear = format(date, "MMMM yyyy");
  return monthYear;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subContainer: {
    alignItems: "center",
  },
  nameContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    gap: 8,
    marginBottom: 5,
  },
  descriptionContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 5,
  },
  createdContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    gap: 8,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 18, fontFamily: "HostGrotesk-Medium", marginLeft: 90 },
  profileContainer: {
    width: 60,
    height: 60,
    borderRadius: 100,
    overflow: "hidden",
    alignItems: "center",
    marginBottom: 15,
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editButton: { position: "absolute", bottom: 5, right: 5 },
  initials: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
  },
  profileFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#c4c4c4",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ClubDetailsCard;
