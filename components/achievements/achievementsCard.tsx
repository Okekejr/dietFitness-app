import { AchievementCardProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Animated } from "react-native";
import CustomText from "../ui/customText";

const AchievementCard = ({ goal, unlocked }: AchievementCardProps) => {
  return (
    <Animated.View
      style={[styles.card, unlocked ? styles.unlocked : styles.locked]}
    >
      <Ionicons
        name={goal.icon as keyof typeof Ionicons.glyphMap}
        size={50}
        color="#000"
        style={styles.icon}
      />

      <CustomText style={styles.name}>{goal.name}</CustomText>
      <CustomText style={styles.description}>{goal.description}</CustomText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 20,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: 100,
  },
  unlocked: {
    backgroundColor: "#4CAF50",
  },
  locked: {
    backgroundColor: "#D3D3D3",
  },
  icon: {
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});

export default AchievementCard;
