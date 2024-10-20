import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { WorkoutsT } from "@/types/workout";

interface WorkoutCompCardProps {
  data: WorkoutsT[] | undefined;
  cardLink: Href<string>;
  cardName: string;
  bgImgLink: ImageSourcePropType;
}

const WorkoutCompCard: FC<WorkoutCompCardProps> = ({
  data,
  cardLink,
  cardName,
  bgImgLink,
}) => {
  const router = useRouter();
  const numWorkouts = data ? data.length : 0;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => router.push(cardLink)}
    >
      <Image source={bgImgLink} style={styles.imageStyle} />
      <View style={styles.textContainer}>
        <Text style={styles.cardName}>{cardName}</Text>
        <Text style={styles.workoutCount}>
          {numWorkouts} {numWorkouts === 1 ? "workout" : "workouts"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
  },
  imageStyle: {
    width: 150,
    height: 150,
    borderRadius: 5,
    marginRight: 12,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#000",
    marginTop: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  workoutCount: {
    fontSize: 12,
    color: "#444",
  },
});

export default WorkoutCompCard;
