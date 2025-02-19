import { API_URL } from "@/constants/apiUrl";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import RouteCard from "./routesCard";
import { RouteData } from "@/types";
import CustomText from "../ui/customText";

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

  if (isLoading) return <CustomText>Loading routes...</CustomText>;
  if (error) return <CustomText>Error fetching routes</CustomText>;

  // Sort the routes by dateCreated in ascending order (oldest to latest)
  const sortedRoutes = routesData?.sort((a, b) => {
    return (
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <CustomText style={styles.title}>Latest Routes</CustomText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {sortedRoutes && sortedRoutes?.length > 0 ? (
          sortedRoutes?.map((route, index) => (
            <RouteCard
              key={index}
              startPoint={route.startPoint}
              endPoint={route.endPoint}
              estimatedTime={route.estimatedTime}
              estimatedDistance={route.estimatedDistance}
              dateCreated={route.dateCreated}
            />
          ))
        ) : (
          <>
            <View style={styles.centeredContainer}>
              <CustomText style={styles.emptyText}>
                No routes have been created yet...
              </CustomText>
            </View>
          </>
        )}
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
  title: { fontSize: 18, fontFamily: "HostGrotesk-Medium", marginLeft: 90 },
  scrollViewContainer: {
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 8,
  },
});

export default RouteUpdatesCard;
