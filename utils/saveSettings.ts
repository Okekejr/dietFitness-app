import * as SecureStore from "expo-secure-store";

// Save biometric setting
export const saveBiometricPreference = async (
  userId: string,
  enabled: boolean
) => {
  try {
    // Save using user-specific key to avoid conflicts between users
    const key = `biometricEnabled_${userId}`;
    await SecureStore.setItemAsync(key, JSON.stringify(enabled));
    console.log("Biometric preference saved.");
  } catch (error) {
    console.error("Failed to save biometric preference:", error);
  }
};

export const getBiometricPreference = async (
  userId: string
): Promise<boolean> => {
  try {
    const key = `biometricEnabled_${userId}`;
    const storedPreference = await SecureStore.getItemAsync(key);
    return storedPreference ? JSON.parse(storedPreference) : false; // Default to false
  } catch (error) {
    console.error("Failed to get biometric preference:", error);
    return false;
  }
};

export const clearBiometricPreference = async (userId: string) => {
  try {
    const key = `biometricEnabled_${userId}`;
    await SecureStore.deleteItemAsync(key);
    console.log("Biometric preference cleared.");
  } catch (error) {
    console.error("Failed to clear biometric preference:", error);
  }
};

export const clearAllStoredItems = async () => {
  try {
    // List all the keys you want to delete
    const keysToDelete = [
      "biometric_email",
      "biometric_password",
      // Add any other keys you have stored in SecureStore
    ];

    // Loop through each key and delete it
    for (let key of keysToDelete) {
      await SecureStore.deleteItemAsync(key);
    }

    console.log("All items cleared from SecureStore.");
  } catch (error) {
    console.error("Error clearing SecureStore items:", error);
  }
};
