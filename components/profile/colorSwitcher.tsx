import { useTheme } from "@/context/userThemeContext";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "../ui/customText";

export const ColorSwitcher = () => {
  const { theme, setColorMode } = useTheme();

  return (
    <View style={styles.container}>
      <CustomText style={styles.currentTheme}>
        Current Theme: {theme}
      </CustomText>
      <TouchableOpacity
        onPress={() => setColorMode("light")}
        style={styles.button}
      >
        <CustomText style={styles.text}>Light Mode</CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setColorMode("dark")}
        style={styles.button}
      >
        <CustomText style={styles.text}>Dark Mode</CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setColorMode("system")}
        style={styles.button}
      >
        <CustomText style={styles.text}>System Mode</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 40 },
  currentTheme: { fontSize: 16, marginBottom: 10 },
  button: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  text: { color: "white", fontSize: 16 },
});
