import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/header/header";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ClubData } from "@/types";
import BottomSheetContent from "@/components/BottomSheetContent";

const ClubHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loadingLocation, setLoadingLocation] = useState(true);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedLocation, setSearchedLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ["10%", "50%"], []);

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
    const getLocationUpdates = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoadingLocation(false);
        return;
      }

      // Start watching location changes
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          setLoadingLocation(false);
        }
      );
    };

    getLocationUpdates();
  }, []);

  // const handleSearchLocation = async () => {
  //   try {
  //     const response = await fetch(
  //       `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
  //         searchQuery
  //       )}&key=YOUR_OPENCAGE_API_KEY`
  //     );
  //     const data = await response.json();

  //     if (data.results.length > 0) {
  //       const { lat, lng } = data.results[0].geometry;
  //       setSearchedLocation({ latitude: lat, longitude: lng });
  //     } else {
  //       Alert.alert("Location not found", "Please try a different search.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching location:", error);
  //     Alert.alert("Error", "Failed to search for location.");
  //   }
  // };

  // const handleSheetChanges = useCallback((index: number) => {
  //   console.log("Bottom sheet index changed to:", index);
  // }, []);

  const handleCardPress = (route: string) => {
    router.push(route);
  };

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header with Home Button */}
        <Header>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push("/")}
          >
            <Ionicons name="home-outline" size={20} color="#000" />
          </TouchableOpacity>
        </Header>

        {/* Search Bar and Bookmark Icon */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search location"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.bookmarkButton}>
            <Ionicons name="bookmark-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

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
            showsUserLocation={true} // Display user's location on the map
            followsUserLocation={true} // Keep the map centered on the user
          >
            {/* Pointer at the User's Current Location */}
            {searchedLocation.latitude !== 0 && (
              <Marker coordinate={searchedLocation} title="Searched Location" />
            )}
          </MapView>
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.contentContainer}>
            {club ? (
              <BottomSheetContent
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                club={club}
              />
            ) : (
              "...loading"
            )}
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    position: "absolute",
    top: 130,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    marginRight: 10,
    elevation: 3,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetBackground: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  handleIndicator: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 10,
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
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#007AFF",
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
