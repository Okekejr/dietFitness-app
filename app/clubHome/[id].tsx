import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/header/header";
import { Ionicons } from "@expo/vector-icons";
import { useUserData } from "@/context/userDataContext";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";

interface ClubData {
  id: string;
  name: string;
  description: string;
  location?: string;
  membersCount: number;
}

const ClubHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loadingLocation, setLoadingLocation] = useState(true);
  const router = useRouter();

  // Fetch Club Data
  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ["club", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/clubs/${id}`);
      if (!response.ok) throw new Error("Failed to fetch club data");
      return response.json() as Promise<ClubData>;
    },
    enabled: !!id,
  });

  // Get User Location with Permission Handling
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoadingLocation(false);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
      setLoadingLocation(false);
    };

    getLocation();
  }, []);

  if (loadingLocation || clubLoading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to access location.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Home Button */}
      <Header headerTitle={club?.name}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home-outline" size={20} color="#000" />
        </TouchableOpacity>
      </Header>

      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  mapContainer: {
    flex: 1,
  },
  homeButton: {
    backgroundColor: "#FFF",
    padding: 10,
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default ClubHomeScreen;
