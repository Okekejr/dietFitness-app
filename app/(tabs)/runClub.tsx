import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/constants/apiUrl";
import {
  useMutation,
  UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import { useUserData } from "@/context/userDataContext";
import { CreateClub } from "@/components/clubs/createClub";
import { ClubData } from "@/types";
import { useRouter } from "expo-router";
import JoinClub from "@/components/clubs/joinClub";
import CustomText from "@/components/ui/customText";
import * as Haptics from "expo-haptics";

const ClubScreen = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [logoFile, setLogoFile] = useState<any>(null);
  const [maxMembers, setMaxMembers] = useState<number | null>(null);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [createdClub, setCreatedClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { userData } = useUserData();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const router = useRouter();

  const { data: userClub } = useQuery({
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

  // Handle navigation to ClubHomeScreen
  const handleNavigate = (clubId: string) => {
    router.push({
      pathname: `/clubHome/[id]`,
      params: { id: clubId },
    });
  };

  // Redirect if the user is part of a club
  useEffect(() => {
    if (userClub) {
      handleNavigate(userClub.id);
    }
  }, [userClub]);

  // Open Image Picker to select a club logo
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogoFile(result.assets[0]);
    }
  };

  // Helper function to convert image URI to Blob
  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  // Mutation for creating a club with logo upload
  const createClubMutation: UseMutationResult<ClubData, Error, void> =
    useMutation({
      mutationFn: async (): Promise<ClubData> => {
        if (!userData) throw new Error("User data is not available");

        const formData = new FormData();
        formData.append("userId", userData.user_id);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("location", location);
        formData.append("maxMembers", maxMembers?.toString() || "");

        if (logoFile) {
          const blob = await uriToBlob(logoFile.uri);
          formData.append("clubLogo", blob, `logo-${Date.now()}.jpg`);
        }

        const response = await fetch(`${API_URL}/api/clubs/create`, {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to create club");
        return response.json();
      },
      onSuccess: async (data: ClubData) => {
        try {
          if (!userData) throw new Error("Error adding member");
          // Add creator to the club_members table
          const addMember = await fetch(`${API_URL}/api/clubs/addMember`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userData.user_id,
              clubId: data.id,
              isLeader: true, // Creator is the leader
            }),
          });

          if (addMember.ok) {
            setCreatedClub(data);
            setLoading(false);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to add user as club member.");
          setLoading(false);
        }
      },
      onError: (error: Error) => {
        Alert.alert("Error", error.message);
        setLoading(false);
      },
    });

  const handleCreateClub = () => {
    if (!name || !description || !location || !maxMembers) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    createClubMutation.mutate();
  };

  // Monterrey

  const handleJoinClub = () => {
    setJoinModalVisible(true);
  };

  return (
    <ImageBackground
      source={require("../../assets/img/runClubBackgroud.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Create Club and Join Club Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Haptics.selectionAsync();
            setCreateModalVisible(true);
          }}
        >
          <CustomText style={styles.buttonText}>Create a Club</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            handleJoinClub();
          }}
          style={styles.buttonJoin}
        >
          <CustomText style={styles.buttonText}>Join a Club</CustomText>
        </TouchableOpacity>
      </View>

      {/* Create Club Modal */}
      <CreateClub
        pickImage={pickImage}
        createModalVisible={createModalVisible}
        setCreateModalVisible={setCreateModalVisible}
        loading={loading}
        location={location}
        setLocation={setLocation}
        logoFile={logoFile}
        description={description}
        setDescription={setDescription}
        setMaxMembers={setMaxMembers}
        maxMembers={maxMembers}
        name={name}
        setName={setName}
        handleCreateClub={handleCreateClub}
        createdClub={createdClub}
      />

      <Modal visible={joinModalVisible} animationType="slide">
        <JoinClub onClose={() => setJoinModalVisible(false)} />
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: { alignItems: "center", marginBottom: 10 },
  avatarText: { color: "#4F46E5", marginBottom: 15 },
  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  buttonJoin: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
});

export default ClubScreen;
