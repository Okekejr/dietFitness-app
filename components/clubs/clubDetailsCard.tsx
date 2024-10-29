import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ClubDetailsCardProps {
  onBack: () => void;
  clubName: string;
  clubDescription: string;
}

const ClubDetailsCard: React.FC<ClubDetailsCardProps> = ({
  onBack,
  clubName,
  clubDescription,
}) => (
  <View style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="#4F46E5" />
      </TouchableOpacity>
      <Text style={styles.title}>Club Details</Text>
    </View>
    <Text>Name: {clubName}</Text>
    <Text>Description: {clubDescription}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 100 },
});

export default ClubDetailsCard;
