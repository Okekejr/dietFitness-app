import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";
import {
  UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import { ClubMembersT } from "@/types";

interface ManageGroupCardProps {
  onBack: () => void;
  clubId: string;
  isLeader: boolean;
}

interface deleteMembersProps {
  clubId: string;
  userId: string;
}

// Fetch club members
const fetchClubMembers = async (clubId: string): Promise<ClubMembersT[]> => {
  const request = await fetch(`${API_URL}/api/clubs/${clubId}/users`);
  if (!request.ok) {
    throw new Error("Failed to fetch activity logs");
  }
  return request.json();
};

const deleteClubMember = async ({
  clubId,
  userId,
}: deleteMembersProps): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/clubs/${clubId}/users/${userId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete member");
  }
};

const ManageGroupCard: React.FC<ManageGroupCardProps> = ({
  onBack,
  clubId,
  isLeader,
}) => {
  const queryClient = useQueryClient();

  const {
    data: clubMembers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clubMembers", clubId],
    queryFn: () => fetchClubMembers(clubId),
    staleTime: 5 * 60 * 1000, // 5 mins
    enabled: !!clubId,
  });

  // Mutation to delete a club member
  const deleteMemberMutation: UseMutationResult<
    void,
    Error,
    deleteMembersProps
  > = useMutation({
    mutationFn: deleteClubMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubMembers", clubId] }); // Refresh data
      Alert.alert("Success", "User removed successfully.");
    },
    onError: () => {
      Alert.alert("Error", "Failed to remove user.");
    },
  });

  const handleDelete = (userId: string, userName: string) => {
    // Show confirmation alert before proceeding with deletion
    Alert.alert("Confirm", `Are you sure you want to remove ${userName}?`, [
      { text: "Cancel", style: "cancel" }, // Cancel action
      {
        text: "Remove",
        onPress: () => {
          deleteMemberMutation.mutate({
            clubId, // clubId passed from props
            userId: userId, // userId of the member to be removed
          });
        },
      },
    ]);
  };

  // Loading and error states
  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (isError) {
    return (
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <CustomText style={styles.errorText}>
          Failed to load club members.
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <CustomText style={styles.title}>Manage Group</CustomText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {clubMembers &&
          clubMembers.map((member) => {
            return (
              <View key={member.club_member_id} style={styles.memberRow}>
                <Image
                  source={{ uri: member.profile_picture }}
                  style={styles.workoutImage}
                  contentFit="cover"
                  cachePolicy="disk"
                  placeholder={require("../../assets/img/avatar-placeholder.png")}
                />
                <CustomText style={styles.memberName}>
                  {isLeader && member.is_leader ? "YOU" : member.name}{" "}
                </CustomText>
                <CustomText style={styles.adminName}>
                  {member.is_leader && "Admin"}
                </CustomText>
                {isLeader && !member.is_leader && (
                  <TouchableOpacity
                    onPress={() => handleDelete(member.user_id, member.name)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color="#FF0000"
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
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
  errorText: {
    fontSize: 16,
    color: "red",
    marginLeft: 90,
  },
  scrollViewContainer: {
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "auto",
  },
  workoutImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
  },
  adminName: {
    fontSize: 13,
    flex: 1,
  },
});

export default ManageGroupCard;
