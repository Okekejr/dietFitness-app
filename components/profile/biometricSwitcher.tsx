import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import CustomText from "../ui/customText";
import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import { saveBiometricPreference } from "@/utils";
import { biometricDataT } from "@/types";

interface biometricT {
  userId: string | undefined;
  biometricData: biometricDataT | undefined;
  bioMetricLoading: boolean;
  biometricError: boolean;
}

export const BiometricSwitcher = ({
  userId,
  biometricData,
  bioMetricLoading,
  biometricError,
}: biometricT) => {
  const queryClient = useQueryClient();

  // Define the correct mutation return type and argument types
  const updateBiometricMutation: UseMutationResult<
    void,
    Error,
    boolean,
    unknown
  > = useMutation({
    mutationFn: async (biometricEnabled: boolean) => {
      await fetch(`${API_URL}/api/auth/updateBiometric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          biometricEnabled,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the biometric query
      queryClient.invalidateQueries({ queryKey: ["biometric", userId] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update biometric setting");
    },
  });

  // Toggle biometric setting
  const toggleBiometric = async () => {
    if (!biometricData) return;

    const newState = !biometricData.biometricEnabled;

    updateBiometricMutation.mutate(newState, {
      onSuccess: async () => {
        await saveBiometricPreference(userId!, newState); // Save locally
        console.log("Biometric setting updated successfully");
      },
    });
  };

  if (bioMetricLoading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  if (biometricError) {
    return (
      <View>
        <CustomText style={styles.errorText}>
          Failed to load biometric settings
        </CustomText>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.categoryBox}>
        <Ionicons name="finger-print-outline" size={24} color="#fff" />
        <CustomText style={styles.colorSchemeText}>
          Enable biometric sign in
        </CustomText>

        <Switch
          value={biometricData && biometricData.biometricEnabled}
          onValueChange={toggleBiometric}
        />
      </View>
    </View>
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
