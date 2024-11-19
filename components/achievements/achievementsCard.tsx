import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";
import { AchievementCardProps } from "@/types";

const AchievementCard = ({ goal, unlocked }: AchievementCardProps) => {
  return (
    <View style={[styles.card, unlocked ? styles.unlocked : styles.locked]}>
      <Ionicons
        name={goal.icon as keyof typeof Ionicons.glyphMap}
        size={70}
        color={unlocked ? "#fff" : "#000"}
        style={styles.icon}
      />
      <CustomText style={styles.name}>{goal.name}</CustomText>
      <CustomText style={styles.description}>{goal.description}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D3D3D3",
  },
  unlocked: {
    backgroundColor: "#4CAF50",
  },
  locked: {
    backgroundColor: "#A9A9A9",
  },
  icon: {
    marginBottom: 10,
  },
  name: {
    fontSize: 15,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
  },
  description: {
    fontSize: 11,
    color: "#fff",
    textAlign: "center",
  },
});

export default AchievementCard;
