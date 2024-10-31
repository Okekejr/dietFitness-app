import { API_URL } from "@/constants/apiUrl";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import RouteCard from "./routesCard";
import { RouteData } from "@/types";

interface RouteUpdatesCardT {
  onBack: () => void;
  clubId: string;
}

const RouteUpdatesCard = ({ onBack, clubId }: RouteUpdatesCardT) => {
  const {
    data: routesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routesData", clubId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/clubs/getRoutes/${clubId}`);
      if (!response.ok) throw new Error("Failed to fetch route data");
      const data = await response.json();
      return data.routes as RouteData[];
    },
  });

  if (isLoading) return <Text>Loading routes...</Text>;
  if (error) return <Text>Error fetching routes</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.title}>Latest Routes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {routesData?.map((route, index) => (
          <RouteCard
            key={index}
            startPoint={route.startPoint}
            endPoint={route.endPoint}
            estimatedTime={route.estimatedTime}
            estimatedDistance={route.estimatedDistance}
            dateCreated={route.dateCreated}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  subContainer: {
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 90 },
  scrollViewContainer: {
    alignItems: "flex-start",
    paddingLeft: 5,
  },
});

export default RouteUpdatesCard;
