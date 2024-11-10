import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useUserData } from "@/context/userDataContext";
import { getInitials } from "@/utils";
import CustomText from "../ui/customText";

interface HeaderProps {
  children?: React.ReactNode;
  headerTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ children, headerTitle }) => {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (userData) {
      setUserId(userData.user_id);
    }
  }, [userData]);

  useEffect(() => {
    if (userId) {
      refetchUserData();
    }
  }, [userId]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => {
            router.push("/profile");
            refetchUserData();
          }}
        >
          {userData?.profile_picture ? (
            <Image
              source={{ uri: userData.profile_picture, cache: "force-cache" }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileFallback}>
              <CustomText style={styles.initials}>
                {userData?.name ? getInitials(userData.name) : "?"}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.childrenContainer}>{children}</View>
      </View>
      {headerTitle && (
        <CustomText style={styles.headerTitle}>{headerTitle}</CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingVertical: 5,
    paddingHorizontal: 25,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#c4c4c4",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
  },
  childrenContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    color: "#000",
  },
});

export default Header;
