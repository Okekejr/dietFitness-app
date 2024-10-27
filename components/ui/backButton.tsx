import { Ionicons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { useRouter } from "expo-router";

interface BackButtonProps {
  func?: (event: GestureResponderEvent) => void;
}

const BackButton = ({ func }: BackButtonProps) => {
  const router = useRouter();

  const handlePress = (event: GestureResponderEvent) => {
    if (func) {
      func(event);
    } else {
      router.back();
    }
  };
  return (
    <TouchableOpacity onPress={handlePress} style={styles.backButton}>
      <Ionicons name="chevron-back-outline" size={28} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BackButton;
