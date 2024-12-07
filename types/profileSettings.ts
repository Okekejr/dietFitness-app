import { Ionicons } from "@expo/vector-icons";

export type ProfileConfig = {
  key: string;
  name: string;
  leftIcon: keyof typeof Ionicons.glyphMap;
  rightIcon: keyof typeof Ionicons.glyphMap;
  hrefLink?: string;
  content?: string;
}[];
