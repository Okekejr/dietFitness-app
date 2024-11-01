import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { parseISO, format, formatDistanceToNow } from "date-fns";
import { RouteData } from "@/types";

// Function to get human-readable address from latitude and longitude
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY`
    );
    const data = await response.json();
    return data.results[0]?.formatted || "Unknown Location";
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return "Unknown Location";
  }
};

const RouteCard: React.FC<RouteData> = ({
  startPoint,
  endPoint,
  estimatedTime,
  estimatedDistance,
  dateCreated,
}) => {
  const [startAddress, setStartAddress] = useState<string>("");
  const [endAddress, setEndAddress] = useState<string>("");
  const [relativeTime, setRelativeTime] = useState<string>("");

  useEffect(() => {
    const fetchAddresses = async () => {
      const start = await reverseGeocode(
        startPoint.latitude,
        startPoint.longitude
      );
      const end = await reverseGeocode(endPoint.latitude, endPoint.longitude);
      setStartAddress(start);
      setEndAddress(end);
    };

    fetchAddresses();

    const updateRelativeTime = () => {
      // Use parseISO to handle date strings correctly
      const parsedDate = parseISO(dateCreated);
      setRelativeTime(formatDistanceToNow(parsedDate, { addSuffix: true }));
    };

    updateRelativeTime();

    // Update the relative time every second
    const intervalId = setInterval(updateRelativeTime, 1000);
    return () => clearInterval(intervalId);
  }, [startPoint, endPoint, dateCreated]);

  const openInGoogleMaps = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  const formattedDate = format(new Date(dateCreated), "do MMMM yyyy");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Route Information</Text>
      <View style={styles.routeInfo}>
        <TouchableOpacity
          onPress={() =>
            openInGoogleMaps(startPoint.latitude, startPoint.longitude)
          }
        >
          <Text style={styles.routePoint}>
            Start Point: {startAddress || "Loading..."}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            openInGoogleMaps(endPoint.latitude, endPoint.longitude)
          }
        >
          <Text style={styles.routePoint}>
            End Point: {endAddress || "Loading..."}
          </Text>
        </TouchableOpacity>
        <Text style={styles.details}>Estimated Time: {estimatedTime}</Text>
        <Text style={styles.details}>
          Estimated Distance: {estimatedDistance}
        </Text>
        <Text style={styles.details}>Date Created: {formattedDate}</Text>
        <Text style={styles.timer}>{relativeTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "auto",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  routeInfo: {
    display: "flex",
    flexDirection: "column",
  },
  routePoint: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 4,
    textDecorationLine: "underline",
  },
  details: {
    fontSize: 15,
    marginBottom: 3,
  },
  timer: {
    fontSize: 12,
    color: "#777",
  },
});

export default RouteCard;
