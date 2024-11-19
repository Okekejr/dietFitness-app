import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";
import { API_URL } from "@/constants/apiUrl";
import { useQuery } from "@tanstack/react-query";
import { ActivityLogsT } from "@/types";

interface ActivityFeedCardProps {
  onBack: () => void;
  clubId: string;
}

const fetchActivityLogs = async (clubId: string): Promise<ActivityLogsT[]> => {
  const response = await fetch(`${API_URL}/api/logs/${clubId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch activity logs");
  }
  return response.json();
};

const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({
  onBack,
  clubId,
}) => {
  const {
    data: logData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activityLogs", clubId],
    queryFn: () => fetchActivityLogs(clubId),
    enabled: !!clubId,
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <CustomText style={styles.title}>Activity Feed</CustomText>
      </View>

      {isLoading ? (
        <CustomText>Loading activity logs...</CustomText>
      ) : error ? (
        <CustomText>Error fetching activity logs</CustomText>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {logData && logData.length > 0 ? (
            logData.map((log, index) => (
              <View key={index} style={styles.card}>
                <CustomText style={styles.activityText}>
                  {log.custom_text}
                </CustomText>
                <CustomText style={styles.timestamp}>
                  {new Date(log.timestamp).toLocaleString()}
                </CustomText>
              </View>
            ))
          ) : (
            <View style={styles.centeredContainer}>
              <CustomText>No activity logs found for this club.</CustomText>
            </View>
          )}
        </ScrollView>
      )}
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
  title: { fontSize: 18, fontFamily: "HostGrotesk-Medium", marginLeft: 100 },
  scrollViewContainer: {
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  card: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    fontSize: 14,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ActivityFeedCard;
