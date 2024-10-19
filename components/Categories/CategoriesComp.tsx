import React, { FC, memo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { CategoryT } from "@/types/category";

interface CategoriesCompProps {
  category: CategoryT;
}

const CategoriesComp: FC<CategoriesCompProps> = ({ category }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: `/category/[id]`, params: { id: category.id } })
      }
    >
      <Image
        source={{ uri: category.image_url, cache: "force-cache" }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.textContainer}>
        <Text style={styles.categoryName}>{category.category_name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 5,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 5,
  },
  textContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  categoryName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default memo(CategoriesComp);
