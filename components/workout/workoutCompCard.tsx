import React, { FC } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { WorkoutsT } from "@/types/workout";
import CustomText from "../ui/customText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface WorkoutCompCardProps {
  data: WorkoutsT[] | undefined;
  cardLink: string;
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
  const textColor = useThemeColor({}, "text");
  const subTextColor = useThemeColor({}, "subText");

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => router.push(cardLink)}
    >
      <Image source={bgImgLink} style={styles.imageStyle} />
      <View style={styles.textContainer}>
        <CustomText style={[styles.cardName, { color: textColor }]}>
          {cardName}
        </CustomText>
        <CustomText style={[styles.workoutCount, { color: subTextColor }]}>
          {numWorkouts} {numWorkouts === 1 ? "workout" : "workouts"}
        </CustomText>
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
    borderRadius: 15,
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
  },
  workoutCount: {
    fontSize: 12,
  },
});

export default WorkoutCompCard;
