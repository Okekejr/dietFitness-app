import React, { useState } from "react";
import {
  View,
  Text,
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      if (response.ok) {
        Alert.alert("Success", "Club logo updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      } else {
        Alert.alert("Error", data.error || "Failed to update club logo.");
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
        <Text style={styles.title}>Club Details</Text>
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
              <Text style={styles.initials}>
                {club?.name ? getInitials(name) : "?"}
              </Text>
            </View>
          )}

          {isLeader && (
            <TouchableOpacity onPress={pickImage} style={styles.editButton}>
              <Ionicons name="pencil-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}

          {loading && <ActivityIndicator size="large" color="#4F46E5" />}
        </View>
        <View style={styles.nameContainer}>
          <Text style={{ fontWeight: "bold", fontSize: 19 }}>Name:</Text>
          <Text style={{ fontSize: 18 }}>{club.name}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={{ fontWeight: "bold", fontSize: 19 }}>Description:</Text>
          <Text style={{ fontSize: 18, maxWidth: 200 }}>
            {club.description}
          </Text>
        </View>
        <View style={styles.createdContainer}>
          <Text style={{ fontWeight: "bold", fontSize: 19 }}>
            Date created:
          </Text>
          <Text style={{ fontSize: 18 }}>{formatDate(club)}</Text>
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
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 90 },
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
    fontWeight: "bold",
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
