import { Ionicons } from "@expo/vector-icons";

export const getInitials = (name: string | undefined | null) => {
  if (!name || typeof name !== "string") {
    return "";
  }

  const nameParts = name.trim().split(" ");

  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  return `${nameParts[0][0]}.`.toUpperCase();
};

export const getFirstName = (name: string): string => {
  return name.trim().split(" ")[0];
};

export const getTimeOfDay = (): keyof typeof Ionicons.glyphMap => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "cloudy";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "sunny";
  } else {
    return "cloudy-night";
  }
};
