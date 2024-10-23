import React, { useEffect } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getInitials } from "@/utils";
import { useUserData } from "@/context/userDataContext";
import SuperTokens from "supertokens-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();

  useEffect(() => {
    refetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await SuperTokens.signOut();
      Alert.alert("Signed Out", "You have been signed out successfully.");

      // Redirect to the login page
      router.replace("/login");
    } catch (error) {
      Alert.alert("Sign Out Failed", (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileBox}
        onPress={() => router.push("/editProfile")}
      >
        {userData?.profile_picture ? (
          <Image
            source={{ uri: userData.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {userData && getInitials(userData.name)}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{userData && userData.name}</Text>
          <Text style={styles.email}>{userData && userData.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.box}>
        <Ionicons name="settings-outline" size={24} color="#000" />
        <Text style={styles.boxText}>Settings</Text>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.box}>
        <Ionicons name="help-circle-outline" size={24} color="#000" />
        <Text style={styles.boxText}>Help and Info</Text>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.box} onPress={handleSignOut}>
        <Text style={styles.boxText}>Sign out</Text>
        <Ionicons name="log-out-outline" size={24} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  backButton: { position: "absolute", top: 60, left: 20 },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginTop: 40,
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
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  profileInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "bold" },
  email: { fontSize: 14, color: "#777" },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  boxText: { flex: 1, marginLeft: 10, fontSize: 16 },
});
