import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";

interface ActivityFeedCardProps {
  onBack: () => void;
}

const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ onBack }) => (
  <View style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="#4F46E5" />
      </TouchableOpacity>
      <CustomText style={styles.title}>Activity Feed</CustomText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 18, fontFamily: "HostGrotesk-Medium", marginLeft: 100 },
});

export default ActivityFeedCard;
