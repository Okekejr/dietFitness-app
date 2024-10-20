import { useUserData } from "@/context/userDataContext";
import { getInitials } from "@/utils";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text } from "react-native-paper";

export default function HomeScreen() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();

  useEffect(() => {
    refetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => router.push("/profile")}
      >
        {userData?.profile_picture ? (
          <Image
            source={{ uri: userData.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {userData && getInitials(userData?.name)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Add other components for the Home Screen here */}
      <Text variant="headlineMedium">Welcome to the Home Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
