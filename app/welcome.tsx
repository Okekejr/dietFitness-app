import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CustomText from "@/components/ui/customText";

const WelcomeScreen = () => {
  const router = useRouter();
  const [typedText, setTypedText] = useState("");

  const fullText = "FitLife";

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);

        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <CustomText style={styles.animatedText}>{typedText}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  animatedText: {
    fontFamily: "BagelFatOne-Regular",
    fontSize: 55,
    color: "#4F46E5",
    fontWeight: "bold",
    marginBottom: 20,
  },
});

// monterrey

export default WelcomeScreen;
