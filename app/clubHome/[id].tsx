import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/apiUrl";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheetContent from "@/components/BottomSheetContent";
import { ClubData, Coordinate, RouteState, isLeader } from "@/types";
import { decodePolyline, getInitials } from "@/utils";
import { useUserData } from "@/context/userDataContext";

const ClubHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationNames, setLocationNames] = useState({
    pointA: "",
    pointB: "",
  });
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteState>({
    pointA: null,
    pointB: null,
  });
  const [follow, setFollow] = useState(false);
  const [polylineCoords, setPolylineCoords] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [region, setRegion] = useState({
    latitude: 25.686613,
    longitude: -100.316116,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

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

  const { data: isLeader, isLoading: leaderLoading } = useQuery({
    queryKey: ["isLeader", userData?.user_id],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/clubs/isLeader/${id}/${userData?.user_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch leader");
      return response.json() as Promise<isLeader>;
    },
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
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) =>
          setRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          })
      );
      setLoadingLocation(false);
    };
    getLocationUpdates();
  }, []);

  const handleSearchLocation = async () => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchQuery
        )}&key=${process.env.GEOCODING_API_KEY}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        setRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        Alert.alert("Location not found", "Please try a different search.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", "Failed to search for location.");
    }
  };

  // Function to Fetch Directions from Google Maps API
  const fetchDirections = async (pointA: Coordinate, pointB: Coordinate) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${pointA.latitude},${pointA.longitude}&destination=${pointB.latitude},${pointB.longitude}&mode=walking&key=${process.env.GOOGLE_DIRECTIONS_API_KEY}`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        setPolylineCoords(points);
        setDistance(route.legs[0].distance.text); // e.g., "2.5 km"
        setEstimatedTime(route.legs[0].duration.text); // e.g., "30 mins"
      } else {
        Alert.alert("No route found", "Unable to get a route.");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      Alert.alert("Error", "Failed to fetch directions.");
    }
  };

  const reverseGeocode = async (coordinate: Coordinate, point: "A" | "B") => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${coordinate.latitude}+${coordinate.longitude}&key=${process.env.GEOCODING_API_KEY}`
      );
      const data = await response.json();
      const locationName = data.results[0]?.formatted || "Unknown Location";

      setLocationNames((prev) => ({
        ...prev,
        [point === "A" ? "pointA" : "pointB"]: locationName,
      }));
    } catch (error) {
      console.error("Reverse Geocoding Error:", error);
    }
  };

  const saveRoute = async () => {
    if (!route.pointA || !route.pointB || !distance) {
      Alert.alert("Incomplete Data", "Please set both points A and B.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/clubs/saveRoute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: id,
          point_a: route.pointA,
          point_b: route.pointB,
          distance,
          estimated_time: estimatedTime,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Route saved successfully!");
      } else {
        throw new Error("Failed to save route.");
      }
    } catch (error) {
      console.error("Error saving route:", error);
      Alert.alert("Error", "Could not save the route.");
    }
  };

  const handleMapPress = (event: {
    nativeEvent: { coordinate: Coordinate };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setRoute((prev) => {
      if (!prev.pointA) {
        reverseGeocode({ latitude, longitude }, "A");
        return { ...prev, pointA: { latitude, longitude } };
      } else if (!prev.pointB) {
        const pointB = { latitude, longitude };
        reverseGeocode(pointB, "B");
        fetchDirections(prev.pointA!, pointB);
        return { ...prev, pointB };
      }
      return prev;
    });
  };

  const resetHandler = () => {
    setRoute({ pointA: null, pointB: null });
    setPolylineCoords([]);
    setDistance(null);
    setEstimatedTime("");
  };

  const toggleFollow = () => {
    setFollow((prev) => !prev);
  };

  if (loadingLocation || clubLoading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Search Bar only available to leader */}
      {isLeader?.isLeader && (
        <BlurView tint="dark" intensity={80} style={styles.searchContainer}>
          <TextInput
            placeholder="Search location"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            onSubmitEditing={handleSearchLocation}
          />
          <View style={styles.profileContainer}>
            {club?.logo ? (
              <Image
                source={{ uri: club.logo, cache: "force-cache" }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileFallback}>
                <Text style={styles.initials}>
                  {club?.name ? getInitials(club.name) : "?"}
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      )}

      <BlurView tint="dark" style={styles.homeContainer}>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.bookmarkButton}
        >
          <Ionicons name="home-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </BlurView>

      <BlurView tint="dark" style={styles.navContainer}>
        <TouchableOpacity onPress={toggleFollow} style={styles.bookmarkButton}>
          <Ionicons
            name={follow ? "navigate-circle" : "navigate-circle-outline"}
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>
      </BlurView>

      {route.pointA && (
        <BlurView tint="dark" style={styles.clearContainer}>
          <TouchableOpacity
            onPress={resetHandler}
            style={styles.bookmarkButton}
          >
            <Ionicons name="reload-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </BlurView>
      )}

      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          onPress={isLeader?.isLeader ? handleMapPress : () => null}
          showsUserLocation={true} // Display user's location on the map
          zoomEnabled={true}
          zoomControlEnabled={true}
          followsUserLocation={follow}
        >
          {route.pointA && (
            <Marker coordinate={route.pointA} pinColor="green" />
          )}
          {route.pointB && <Marker coordinate={route.pointB} pinColor="red" />}
          {polylineCoords.length > 0 && (
            <Polyline
              coordinates={polylineCoords}
              strokeColor="#4F46E5"
              strokeWidth={3}
            />
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
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Explore Your Club</Text>
            <Text style={styles.sectionSubtitle}>
              Get insights, activities, and updates about "{club && club.name}
              ".
            </Text>
          </View>

          <ScrollView style={styles.routeInfo}>
            {route.pointA && <Text>Point A: {locationNames.pointA}</Text>}
            {route.pointB && <Text>Point B: {locationNames.pointB}</Text>}
            {distance && <Text>Distance: {distance}</Text>}
            {estimatedTime && <Text>Estimated Time: {estimatedTime}</Text>}

            {route.pointB && (
              <TouchableOpacity style={styles.saveButton} onPress={saveRoute}>
                <Text style={styles.saveButtonText}>Save Route</Text>
              </TouchableOpacity>
            )}

            {club && isLeader ? (
              <BottomSheetContent
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                club={club}
                isLeader={isLeader?.isLeader}
              />
            ) : (
              "...loading"
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
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
  clearContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 300,
    right: 20,
    zIndex: 10,
  },
  navContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 250,
    right: 20,
    zIndex: 10,
  },
  homeContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 200,
    right: 20,
    zIndex: 10,
  },
  searchContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingHorizontal: 10,
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
  header: { marginBottom: 10 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  sectionSubtitle: { fontSize: 16, color: "#777" },
  routeInfo: {
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#34D399",
    padding: 15,
    borderRadius: 10,
  },
  saveButtonText: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
});

export default ClubHomeScreen;
