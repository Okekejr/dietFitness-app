import React, { FC, memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { CategoryT } from "@/types";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";

interface CategoriesCompProps {
  category: CategoryT;
}

const CategoriesComp: FC<CategoriesCompProps> = ({ category }) => {
  const router = useRouter();

  const handleRoute = () => {
    router.push({ pathname: `/category/[id]`, params: { id: category.id } });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Haptics.selectionAsync();
        handleRoute();
      }}
    >
      <Image
        source={{ uri: category.image_url }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="disk"
        placeholder={require("../../assets/img/avatar-placeholder.png")}
      />

      <View style={styles.textContainer}>
        <CustomText style={styles.categoryName}>
          {category.category_name}
        </CustomText>
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
    height: 160,
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
    fontFamily: "HostGrotesk-Medium",
  },
});

export default memo(CategoriesComp);
