import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonLoading from "expo-skeleton-loading/index";

export const WorkoutCardSkeleton = () => {
  return (
    <SkeletonLoading background="#d3d3d3" highlight="#e8e8e8">
      <View style={styles.workoutCard}>
        <View style={styles.workoutImage} />

        <View style={styles.workoutInfo}>
          <View style={styles.workoutName} />

          <View style={styles.innerInfo}>
            <View style={styles.textShort} />
            <View style={styles.textShort} />
            <View style={styles.textShort} />
            <View style={styles.textShort} />
          </View>
        </View>
      </View>
    </SkeletonLoading>
  );
};

export const SearchBarSkeleton = () => {
  return (
    <>
      <SkeletonLoading background="#d3d3d3" highlight="#e8e8e8">
        <View style={styles.searchInputContainer}></View>
      </SkeletonLoading>
    </>
  );
};

export const CategoriesSkeleton = () => {
  return (
    <SkeletonLoading background="#d3d3d3" highlight="#e8e8e8">
      <>
        <View style={styles.card}>
          <View style={styles.image} />
        </View>
      </>
    </SkeletonLoading>
  );
};

export const WorkoutCompSkeleton = () => {
  return (
    <SkeletonLoading background="#d3d3d3" highlight="#e8e8e8">
      <>
        <View style={styles.cardContainer}>
          <View style={styles.imageStyle} />
          <View style={styles.textContainer}>
            <View style={styles.textShort} />
          </View>
        </View>
      </>
    </SkeletonLoading>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderRadius: 10,
    marginBottom: 20,
  },
  workoutImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 12,
    backgroundColor: "#adadad",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    width: "60%",
    height: 15,
    marginBottom: 10,
    backgroundColor: "#adadad",
    borderRadius: 5,
  },
  innerInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 12,
  },
  textShort: {
    width: "40%",
    height: 10,
    backgroundColor: "#adadad",
    borderRadius: 5,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 10,
    padding: 10,
    backgroundColor: "#d3d3d3",
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
  },
  header: {
    marginVertical: 20,
  },
  card: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#d3d3d3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 5,
    backgroundColor: "#d3d3d3",
  },
  cardContainer: {
    width: 160,
    marginTop: 20,
  },
  imageStyle: {
    width: 150,
    height: 150,
    borderRadius: 15,
    marginRight: 12,
    backgroundColor: "#d3d3d3",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#000",
    marginTop: 10,
  },
});
