/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from "@/context/userThemeContext";
import { Colors } from "@/constants/Colors";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme();
  const colorFromProps = props[theme];

  return colorFromProps || Colors[theme][colorName];
}
