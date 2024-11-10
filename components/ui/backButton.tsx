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
      <Ionicons name="chevron-back-outline" size={28} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
});

export default BackButton;
