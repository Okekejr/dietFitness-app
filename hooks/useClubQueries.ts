import { API_URL } from "@/constants/apiUrl";
import { ClubData, Coordinate, RouteState, UserDataT, isLeader } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { decodePolyline } from "@/utils";
import { Alert } from "react-native";

interface QueryType {
  id: string | string[];
  userData: UserDataT | null;
}

export const useClubQueries = ({ id, userData }: QueryType) => {
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationNames, setLocationNames] = useState({
    pointA: "",
    pointB: "",
  });
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
  const [savedRoute, setSavedRoutes] = useState(false);
  const [region, setRegion] = useState({
    latitude: 25.686613,
    longitude: -100.316116,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

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
          clubId: id,
          pointA: route.pointA,
          pointB: route.pointB,
          distance,
          estimatedTime,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setSavedRoutes(true);
        resetHandler();
        Alert.alert(
          "Success",
          responseData.message || "Route saved successfully."
        );
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

  return {
    loadingLocation,
    locationNames,
    clubLoading,
    isLeader,
    searchQuery,
    setSearchQuery,
    handleSearchLocation,
    club,
    follow,
    toggleFollow,
    route,
    resetHandler,
    savedRoute,
    distance,
    region,
    estimatedTime,
    setRegion,
    saveRoute,
    handleMapPress,
    polylineCoords,
    selectedCard,
    setSelectedCard,
    setSavedRoutes,
  };
};
