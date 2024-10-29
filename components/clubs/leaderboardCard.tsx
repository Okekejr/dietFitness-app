import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LeaderBoardCardProps {
  onBack: () => void;
}

const LeaderBoardCard: React.FC<LeaderBoardCardProps> = ({ onBack }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="chevron-back" size={24} color="#4F46E5" />
    </TouchableOpacity>
    <Text style={styles.title}>Leaderboard Card</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
});

export default LeaderBoardCard;
