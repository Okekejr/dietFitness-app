import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";

interface ClubCardsProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: (event: GestureResponderEvent) => void;
}

const ClubCards: React.FC<ClubCardsProps> = ({
  title,
  description,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Ionicons name={icon} size={24} color="#4F46E5" />
        <View style={styles.textContainer}>
          <CustomText style={styles.title}>{title}</CustomText>
          <CustomText style={styles.description}>{description}</CustomText>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    color: "#000",
  },
  description: {
    fontSize: 14,
    color: "#777",
  },
});

export default ClubCards;
