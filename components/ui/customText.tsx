import React, { FC } from "react";
import {
  Text,
  StyleSheet,
  StyleProp,
  TextStyle,
  TextProps,
} from "react-native";

interface CustomTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const CustomText: FC<CustomTextProps> = ({ style, ...props }) => {
  return <Text style={[styles.defaultFont, style]} {...props} />;
};

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: "HostGrotesk-Regular",
  },
});

export default CustomText;
