import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "../ui/customText";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/constants/apiUrl";
import { useRouter } from "expo-router";
import { useUserData } from "@/context/userDataContext";

interface DeleteAccountT {
  userId: string | undefined;
}

export const DeleteAccount = ({ userId }: DeleteAccountT) => {
  const router = useRouter();
  const { refetchUserData } = useUserData();

  const confirmDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? You have 15 days to reactivate it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: deleteAccount,
          style: "destructive",
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        Alert.alert(
          "Account Deleted",
          "Your account has been successfully deleted."
        );
        refetchUserData();
        router.replace("/signup");
      } else {
        const errorData = await response.json();
        console.error("Error deleting account:", errorData);
        Alert.alert(
          "Error",
          "An error occurred while deleting your account. Please try again."
        );
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert(
        "Error",
        "An error occurred while deleting your account. Please try again."
      );
    }
  };

  return (
    <TouchableOpacity onPress={confirmDelete}>
      <View style={styles.categoryBox}>
        <CustomText style={styles.colorSchemeText}>Delete Account</CustomText>

        <Ionicons name="trash" size={24} color="red" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  colorSchemeText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
});
