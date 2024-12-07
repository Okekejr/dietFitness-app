import { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../ui/customText";
import { useTheme } from "@/context/userThemeContext";

type ColorModeT = "light" | "dark" | "system";

const colorModes: ColorModeT[] = ["light", "dark", "system"];

const ColorSwitcher = () => {
  const { theme, setColorMode } = useTheme();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [colorMode, setColorModeState] = useState<ColorModeT>(theme); // default color mode

  const handlePickerToggle = () => {
    setIsPickerVisible((prev) => !prev);
  };

  const handleModeSelect = (mode: ColorModeT) => {
    setColorMode(mode); // Set the new color mode to the theme
    setColorModeState(mode);
    setIsPickerVisible(false); // Close the picker after selection
  };

  return (
    <View>
      <View style={styles.categoryBox}>
        <Ionicons
          name={theme === "dark" ? "moon-outline" : "sunny-outline"}
          size={24}
          color="#fff"
        />
        <CustomText style={styles.colorSchemeText}>Color Scheme</CustomText>
        <TouchableOpacity
          onPress={handlePickerToggle}
          style={styles.pickerButton}
        >
          <CustomText style={styles.pickerText}>
            {colorMode &&
              colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}
          </CustomText>
          <Ionicons
            name={isPickerVisible ? "chevron-up" : "chevron-down"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {isPickerVisible && (
        <View style={styles.pickerList}>
          {colorModes.map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => handleModeSelect(mode)}
              style={styles.pickerItem}
            >
              {theme === mode ? (
                <Ionicons
                  style={{ marginHorizontal: 5 }}
                  name="checkmark-sharp"
                  size={15}
                  color="#fff"
                />
              ) : (
                <View style={{ marginHorizontal: 5, width: 15 }}></View>
              )}

              <Text style={styles.pickerItemText}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  colorSchemeText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerText: {
    color: "#fff",
    marginRight: 5,
    fontSize: 16,
  },
  pickerList: {
    position: "absolute",
    top: 54,
    right: 10,
    backgroundColor: "#444",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 200,
    zIndex: 10,
  },
  pickerItem: {
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  pickerItemText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ColorSwitcher;
