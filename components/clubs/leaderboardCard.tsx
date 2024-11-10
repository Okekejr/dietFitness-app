import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";

interface LeaderBoardCardProps {
  onBack: () => void;
}

const LeaderBoardCard: React.FC<LeaderBoardCardProps> = ({ onBack }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="chevron-back" size={24} color="#4F46E5" />
    </TouchableOpacity>
    <CustomText style={styles.title}>Leaderboard Card</CustomText>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 18, fontFamily: "HostGrotesk-Medium", marginVertical: 10 },
});

export default LeaderBoardCard;
