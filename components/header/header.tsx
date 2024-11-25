import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useUserData } from "@/context/userDataContext";
import { getFirstName, getInitials, getTimeOfDay } from "@/utils";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  children?: React.ReactNode;
  headerTitle?: string;
  showProfileImage?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  children,
  headerTitle,
  showProfileImage,
}) => {
  const router = useRouter();
  const { userData, refetchUserData } = useUserData();
  const [userId, setUserId] = useState("");
  const textColor = useThemeColor({}, "text");
  const nameOfIcon = getTimeOfDay();

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
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/profile");
            refetchUserData();
          }}
        >
          {showProfileImage && (
            <View style={styles.contentContainer}>
              <View
                style={[styles.profileContainer, { borderColor: textColor }]}
              >
                {userData?.profile_picture ? (
                  <Image
                    source={{
                      uri: userData.profile_picture,
                      cache: "force-cache",
                    }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileFallback}>
                    <CustomText style={styles.initials}>
                      {userData?.name ? getInitials(userData.name) : "?"}
                    </CustomText>
                  </View>
                )}
              </View>
              <View style={{ display: "flex", flexDirection: "column" }}>
                <View style={[styles.contentContainer, { gap: 2 }]}>
                  <CustomText
                    style={{
                      color: textColor,
                      fontSize: 14,
                    }}
                  >
                    Hello
                  </CustomText>
                  <Ionicons name={nameOfIcon} size={17} color={textColor} />
                </View>
                <CustomText
                  style={[styles.initials, { color: textColor, fontSize: 16 }]}
                >
                  {userData?.name ? getFirstName(userData?.name) : ""}
                </CustomText>
              </View>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.childrenContainer}>{children}</View>
      </View>
      {headerTitle && (
        <CustomText style={[styles.headerTitle, { color: textColor }]}>
          {headerTitle}
        </CustomText>
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
  contentContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 1,
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
